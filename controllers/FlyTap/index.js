const Puppeteer = require("puppeteer");
const readline = require("../../helpers");

const { cookies } = require("../../config");

const url = "https://www.flytap.com/pt-br/";

const changeStartDate = async (page, date) => {
  await page.waitFor(1000);
  await page.click("#dateDepartureTwoWays");
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(date, { delay: 300 });
};

const changeEndDate = async (page, date) => {
  await page.waitFor(1000);
  await page.click("#dateReturnTwoWays");
  await page.keyboard.type(date, { delay: 300 });
};

const getTextContent = async (page, htmlClassName) => {
  const elements = await page.$$(htmlClassName);
  const textContents = await Promise.all(
    elements.map((element) => {
      return page.evaluate((elem) => elem.textContent, element);
    })
  );
  return textContents;
};

const searchPage = async (browser, text, userAgent) => {
  const splitedText = text.split(" ");
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(userAgent);
  await page.setCookie(...cookies);
  await page.goto(url);
  await page.waitForSelector("#origin");
  await page.waitForSelector("#destination");
  await page.click("#origin"); //Click on origin text box
  await page.keyboard.type(`(${splitedText[0]})`, { delay: 300 }); //Type origin
  await page.waitFor(500);
  await page.click("#destination"); //Click on destination text box
  await page.keyboard.type(`(${splitedText[1]})`, { delay: 300 }); //Type destination
  await page.waitFor(500);
  await changeStartDate(page, splitedText[2]); //Change start date
  await page.waitFor(1000);
  await changeEndDate(page, splitedText[3]); //Change end date
  await page.waitFor(1000);
  await page.click(
    "#jsIbeBookingForm > div:nth-child(2) > div.ibe-wrap-float-submit > button > span > span"
  );
  return page;
};

const getContent = async (page) => {
  await page.waitForSelector("#CabinClassList > a");

  const departureTimes = await getTextContent(page, ".time-info.departure");
  const arivalTimes = await getTextContent(page, ".time-info.arrival");
  const flightCodes = await getTextContent(
    page,
    ".tp-number.open-flight-details"
  );
  const conectionTimes = await getTextContent(page, ".layover-text");
  const economicPrices = await getTextContent(page, ".bold.min-price");

  const parsed = [];

  for (let i = 0; i < economicPrices.length / 2; i++) {
    parsed.push({
      firstFlight: `${departureTimes[i * 2].replace(/\n/g, " ")} ${arivalTimes[
        i * 2
      ]
        .replace(/\n/g, " ")
        .replace(
          "                                     ",
          " ---> "
        )} ${flightCodes[i * 2]
        .replace(/\n/g, " ")
        .replace("Informação acerca do voo", "")
        .replace(/ /g, "")}`,
      secondFlight: `${departureTimes[i * 2 + 1].replace(
        /\n/g,
        " "
      )} ${arivalTimes[i * 2 + 1]
        .replace(/\n/g, " ")
        .replace(
          "                                      ",
          " ---> "
        )} ${flightCodes[i * 2 + 1]
        .replace(/\n/g, " ")
        .replace("Informação acerca do voo", "")
        .replace(/ /g, "")}`,
      conection: conectionTimes[i],
      economic: economicPrices[i % 2 === 0 ? i : i + 1],
      executive: economicPrices[i % 2 === 0 ? i + 1 : i],
    });
  }

  return parsed;
};

const nextSearch = async (page, text) => {
  console.log("Entrou aqui");
  const splitedText = text.split(" ");
  await page.click(
    "#main-content > div > div.flight-results-placeholder > section.search-resume > section > div > div.column.modify > a"
  );
  await page.waitForSelector(
    "#ctl00_PageContent_MiniFlightScheduler_ReturnScheduler_Origin_AirportText"
  );
  await page.click(
    "#ctl00_PageContent_MiniFlightScheduler_ReturnScheduler_Origin_AirportText"
  );
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(`(${splitedText[0]})`, { delay: 300 }); //Type origin
  await page.waitFor(500);
  await page.click(
    "##ctl00_PageContent_MiniFlightScheduler_ReturnScheduler_Origin_AirportText"
  ); //Click on destination text box
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(`(${splitedText[1]})`, { delay: 300 }); //Type destination
  await page.waitFor(500);
  await page.click(
    "#ctl00_PageContent_MiniFlightScheduler_ReturnScheduler_ReturnTripDatePicker_DatepickerFrom"
  );
  await page.click(
    "#ctl00_PageContent_MiniFlightScheduler_ReturnScheduler_ReturnTripDatePicker_DatepickerFrom"
  );
  await changeStartDate(page, splitedText[2]); //Change start date
  await page.waitFor(1000);
  await page.click(
    "#ctl00_PageContent_MiniFlightScheduler_ReturnScheduler_ReturnTripDatePicker_DatepickerTo"
  );
  await page.click(
    "#ctl00_PageContent_MiniFlightScheduler_ReturnScheduler_ReturnTripDatePicker_DatepickerTo"
  );
  await changeStartDate(page, splitedText[3]); //Change end date
  await page.waitFor(1000);
  await page.click("#ctl00_PageContent_MiniFlightScheduler_SearchFlights");

  return page;
};

const questionMenu = async () => {
  const text = await readline(
    "> Usage: origem destino data_inicio data_fim\n> Exemplo: ORY GRU 20/12/2020 25/12/2020\n> Para sair digite 0\n> Digite: "
  );
  return text;
};

const startProcess = async (userAgent) => {
  const browser = await Puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  let text;
  let page;
  let siteContent;
  while (true) {
    text = await questionMenu();
    if (text === "0") break;
    page = await searchPage(browser, text, userAgent);
    siteContent = await getContent(page);
    console.log(siteContent);
  }

  await browser.close();
  console.log("> Finished crawling");
};

module.exports = startProcess;
