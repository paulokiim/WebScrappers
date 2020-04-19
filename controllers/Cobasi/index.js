const Puppeteer = require("puppeteer");
const readline = require("../../helpers");

const url = "https://www.cobasi.com.br/";

const getWeb = async (browser, text, userAgent) => {
  console.log("> Started to crawl ", url);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(userAgent);
  await page.goto(url);
  await page.waitForSelector(
    "body > header > div.container > div > div.col-6_md-12-middle.order-one.d-lg-flex > div > fieldset > input.fulltext-search-box.ui-autocomplete-input.neemu-search-field"
  );
  await page.click(
    "body > header > div.container > div > div.col-6_md-12-middle.order-one.d-lg-flex > div > fieldset > input.fulltext-search-box.ui-autocomplete-input.neemu-search-field"
  );
  await page.waitFor(500);
  await page.keyboard.type(text, { delay: 200 });
  await page.waitFor(500);
  await page.click(
    "body > header > div.container > div > div.col-6_md-12-middle.order-one.d-lg-flex > div > fieldset > input.btn-buscar"
  );
  await page.waitForSelector(
    "#nm-product-3318701 > div.nm-product-info > a > div.nm-prices-container > div > div"
  );
  const productNameElements = await page.$$(".nm-product-name");
  const productNames = await Promise.all(
    productNameElements.map((element) => {
      return page.evaluate((elem) => elem.textContent, element);
    })
  );

  const productPriceElements = await page.$$(".nm-price-value");
  const productPrices = await Promise.all(
    productPriceElements.map((element) => {
      return page.evaluate((elem) => elem.textContent, element);
    })
  );

  const result = [];
  productPrices.forEach((item, index) => {
    result.push({
      name: productNames[index],
      price: item,
    });
  });

  await browser.close();
  console.log("> Finished crawling");

  return result;
};

const startProcess = async (userAgent) => {
  const text = await readline("O que voce deseja procurar? ");
  const browser = await Puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const crawlResult = await getWeb(browser, text, userAgent);
  console.log(crawlResult);
};

module.exports = startProcess;
