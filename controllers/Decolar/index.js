const Puppeteer = require("puppeteer");
const readline = require("../../helpers");

const months = {
  "01": 5,
  "02": 1,
  "03": "Março",
  "04": "Abril",
  "05": 5,
  "06": 1,
  "07": 3,
  "08": 6,
  "09": 2,
  "10": 4,
  "11": 7,
  "12": 2,
};

const url = "https://www.decolar.com/passagens-aereas/";

const getTextContent = async (page, htmlClassName) => {
  const elements = await page.$$(htmlClassName);
  const textContents = await Promise.all(
    elements.map((element) => {
      return page.evaluate((elem) => elem.textContent, element);
    })
  );
  return textContents;
};

const getProductInformations = async (page) => {
  const flightPrices = await getTextContent(page, ".flight-price-label");
  const flightInfos = await getTextContent(
    page,
    ".route-info-item.route-info-item-airport.airport"
  );
  const airlineCompany = await getTextContent(
    page,
    ".airline-container.airline-logo-name-container.name"
  );
  const departureTime = await getTextContent(page, ".hour");
  const arrivalTime = await getTextContent(page, ".hour-wrapper");
  const accumulatePoints = await getTextContent(
    page,
    ".description.frequent-flyer"
  );
  const connections = await getTextContent(page, ".stops-text");
  const totalTime = await getTextContent(page, ".best-duration");
  const links = await getTextContent(page, ".btn-text");

  return {
    flightPrices,
    flightInfos,
    airlineCompany,
    departureTime,
    arrivalTime,
    accumulatePoints,
    totalTime,
    connections,
    links,
  };
};

const getResult = async (page) => {
  await page.waitForSelector(
    "#flights-container > div > div.results-container > div > div.col.-lg-9.-md-12.-sm-12.results-content-container > div > div.main-content.-show"
  );
  const {
    flightPrices,
    flightInfos,
    airlineCompany,
    departureTime,
    arrivalTime,
    totalTime,
    connections,
    accumulatePoints,
    links,
  } = await getProductInformations(page);
  console.log(airlineCompany);

  return flightPrices.map((price, index) => {
    return {
      airlineCompany: airlineCompany[index * 2],
      // departureDate: `${flightInfos[index * 4]} ${connections[index * 2]} ${
      //   flightInfos[index * 4 + 1]
      // } ${totalTime[index * 2]}`,
      // returnDate: `${flightInfos[index * 4 + 2]} ${
      //   connections[index * 2 + 1]
      // } ${flightInfos[index * 4 + 3]} ${totalTime[index * 2 + 1]}`,
      // goingTime: `${departureTime[index * 2]} ${arrivalTime[index * 2]} `,
      // returnTime: `${departureTime[index * 2 + 1]} ${
      //   arrivalTime[index * 2 + 1]
      // }`,
      // accumulatePoints: accumulatePoints[index]
      //   ? accumulatePoints[index]
      //   : "Nao ganha nada",
      // price,
      // links: links[index],
    };
  });
};

const searchText = async (browser, text, userAgent) => {
  console.log("> Started to crawl ", url);
  const splitedText = text.split(" ");
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(userAgent);
  await page.goto(url);
  await page.waitForSelector(
    "#searchbox-sbox-box-flights > div > div > div.sbox-mobile-body > div.sbox-row.-wrap.-row-top.sbox-bind-show-roundtrip-container > div.sbox-places-group-container.sbox-row.-mb5-m.-wrap-s > div.sbox-place-container.-mb4-s > div > div > div > input"
  );
  await page.click(
    "#searchbox-sbox-box-flights > div > div > div.sbox-mobile-body > div.sbox-row.-wrap.-row-top.sbox-bind-show-roundtrip-container > div.sbox-places-group-container.sbox-row.-mb5-m.-wrap-s > div.sbox-place-container.-mb4-s > div > div > div > input"
  );
  await page.waitFor(500);
  await page.keyboard.type(splitedText[0], { delay: 200 });
  await page.waitFor(800);
  await page.keyboard.press("Enter");
  await page.waitFor(500);
  await page.click(
    "#searchbox-sbox-box-flights > div > div > div.sbox-mobile-body > div.sbox-row.-wrap.-row-top.sbox-bind-show-roundtrip-container > div.sbox-places-group-container.sbox-row.-mb5-m.-wrap-s > div.sbox-second-place-container.-ml1-m.-ml1-l > div > div > div > div > input"
  );
  await page.waitFor(500);
  await page.keyboard.type(splitedText[1], { delay: 200 });
  await page.waitFor(800);
  await page.keyboard.press("Enter");
  await page.waitFor(500);
  await page.click(
    "#searchbox-sbox-box-flights > div > div > div.sbox-mobile-body > div.sbox-row.-wrap.-row-top.sbox-bind-show-roundtrip-container > div.sbox-row.-wrap.sbox-dates-container.-mb3-m.-mb4-s.-mh3-l > div.sbox-dates-row.sbox-row > div.sbox-3-input.-md.sbox-3-validation.-top-right.-icon-left.sbox-dates-input.sbox-bind-error-flight-roundtrip-start-date-empty.sbox-datein-container > div.input-container.sbox-bind-event-click-start-date > input"
  );
  const actualDateElement = await page.$(
    "._dpmg2--month._dpmg2--o-3._dpmg2--month-active"
  );
  const actualDate = await page.evaluate(
    (elem) => elem.getAttribute("data-month"),
    actualDateElement
  );
  const splitedDate = actualDate.split("-");
  const actualMonth = splitedDate[1];
  // const actualYear = splitedDate[0];
  const splitedDepartureDate = splitedText[2].split("/");
  const departureDay = splitedDepartureDate[0];
  const departureMonth = splitedDepartureDate[1];
  // const departureYear = splitedDepartureDate[2];
  const splitedReturnDate = splitedText[3].split("/");
  const returnDay = splitedReturnDate[0];
  const returnMonth = splitedReturnDate[1];
  // const returnYear = splitedReturnDate[2];
  for (let i = 0; i < departureMonth - actualMonth; i++) {
    await page.click(
      "body > div.datepicker-flights-main > div > div._dpmg2--controlsWrapper > div._dpmg2--controls-next > i"
    );
    await page.waitFor(500);
  }
  await page.click(
    `body > div.datepicker-flights-main > div > div._dpmg2--months > div._dpmg2--month._dpmg2--o-${months[departureMonth]}._dpmg2--month-active > div._dpmg2--dates > span:nth-child(${departureDay})`
  );
  await page.waitFor(500);
  if (departureMonth === returnMonth) {
    await page.click(
      `body > div.datepicker-flights-main > div > div._dpmg2--months > div._dpmg2--month._dpmg2--o-2._dpmg2--month-active > div._dpmg2--dates > span:nth-child(${returnDay})`
    );
  } else {
    for (let i = 0; i < returnMonth - departureMonth; i++) {
      await page.click(
        "body > div.datepicker-flights-main > div > div._dpmg2--controlsWrapper > div._dpmg2--controls-next > i"
      );
      await page.waitFor(500);
    }
    await page.click(
      `body > div.datepicker-flights-main > div > div._dpmg2--months > div._dpmg2--month._dpmg2--o-${months[returnMonth]}._dpmg2--month-active > div._dpmg2--dates > span:nth-child(${returnDay})`
    );
  }
  await page.click(
    "#searchbox-sbox-box-flights > div > div > div.sbox-mobile-body > div.sbox-row.-wrap.-row-top.sbox-bind-show-roundtrip-container > div.sbox-button.-ml3-l.-mt5-l > div > a > em"
  );

  return page;
};

const crawlPage = async (page) => {
  const result = await getResult(page);

  return result;
};

const startProcess = async (userAgent) => {
  const text = await readline(
    "> Usage: origem destino dataInicio dataFim\n> Exemplo: Sao Paulo Paris 21/12/2020 25/12/2020\n> Digite sua pesquisa "
  );
  const browser = await Puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const searchedPage = await searchText(browser, text, userAgent);
  const result = await crawlPage(searchedPage);
  console.log(result);
  await browser.close();
  console.log("> Finished crawling");
};

module.exports = startProcess;
