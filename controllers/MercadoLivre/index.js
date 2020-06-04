const Puppeteer = require("puppeteer");
const readline = require("../../helpers");

const url = "https://www.mercadolivre.com.br/";

const gotoNextPage = async (page) => {
  try {
    await page.click(
      "#results-section > div.pagination__container > ul > li.andes-pagination__button.andes-pagination__button--next > a"
    );
    return true;
  } catch (error) {
    console.log("> Nao existe mais proxima pagina");
    return false;
  }
};

const sortProductPrices = (crawlResult) => {
  // Ordem decrescente
  const sortedResult = crawlResult.sort((first, second) => {
    if (first.price > second.price) return 1;
    if (first.price < second.price) return -1;
    return 0;
  });
  return sortedResult;
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

const getProductInformations = async (page) => {
  const productNames = await getTextContent(page, ".main-title");
  const productPrices = await getTextContent(page, ".price__fraction");
  const productCurrencys = await getTextContent(page, ".price__symbol");
  const productShippings = await getTextContent(page, ".text-shipping");
  const productConditions = await getTextContent(page, ".item__condition");
  const installmentMultipliers = await getTextContent(
    page,
    ".item-installments-multiplier"
  );
  const installmentPrices = await getTextContent(
    page,
    ".item-installments-price"
  );
  const installmentInterests = await getTextContent(
    page,
    ".item-installments-interest"
  );

  const linksElement = await page.$$(".item__info-title");
  const links = await Promise.all(
    linksElement.map((element) => {
      return page.evaluate((elem) => elem.getAttribute("href"), element);
    })
  );

  return {
    productNames,
    productPrices,
    productCurrencys,
    productShippings,
    productConditions,
    installmentMultipliers,
    installmentPrices,
    installmentInterests,
    links,
  };
};

const getResult = async (page) => {
  await page.waitForSelector("#results-section");
  const {
    productNames,
    productPrices,
    productCurrencys,
    productShippings,
    productConditions,
    installmentMultipliers,
    installmentPrices,
    installmentInterests,
    links,
  } = await getProductInformations(page);

  return productPrices.map((item, index) => {
    const floatPrice = item.indexOf(".");
    return {
      nome: productNames[index],
      moeda: productCurrencys[index],
      preco: floatPrice !== -1 ? Number(item) * 1000 : Number(item),
      link: links[index],
      frete: productShippings[index] ? productShippings[index] : "Com frete",
      condition: productConditions[index] ? "Usado" : "Novo",
      juros: `${installmentMultipliers[index]}${installmentPrices[index]}${
        installmentInterests[index] ? "sem juros" : "com juros"
      }`,
    };
  });
};

const searchText = async (browser, text, userAgent) => {
  console.log("> Started to crawl ", url);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(userAgent);
  await page.goto(url);
  await page.waitForSelector("body > header > div > form > input");
  await page.click("body > header > div > form > input");
  await page.waitFor(500);
  await page.keyboard.type(text, { delay: 200 });
  await page.keyboard.press("Enter");

  return page;
};

const crawlAllPages = async (page) => {
  const crawlResult = [];
  do {
    const result = await getResult(page);
    crawlResult.push(...result);
  } while (await gotoNextPage(page));

  return crawlResult;
};

const crawlNPages = async (page, pagesToCrawl) => {
  const crawlResult = [];
  for (let i = 1; i <= pagesToCrawl; i++) {
    const result = await getResult(page);
    crawlResult.push(...result);
  }

  return crawlResult;
};

const startProcess = async (userAgent) => {
  const crawlResult = [];
  const text = await readline("> O que voce deseja procurar? ");
  const userResponse = await readline(
    "> 1-Percorrer todas as paginas\n> 2-Percorrer apenas 5 paginas\n> 3-Percorrer apenas a primeira pagina\n"
  );
  const browser = await Puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const searchedPage = await searchText(browser, text, userAgent);
  if (userResponse === "1") {
    const result = await crawlAllPages(searchedPage);
    crawlResult.push(...result);
  } else if (userResponse === "2") {
    const result = await crawlNPages(searchedPage, 5);
    crawlResult.push(...result);
  } else if (userResponse === "3") {
    const result = await crawlNPages(searchedPage, 1);
    crawlResult.push(...result);
  }
  const sortedPrices = sortProductPrices(crawlResult);
  console.log("> Top 5 cheapest products\n", sortedPrices.slice(0, 5));
  await browser.close();
  console.log("> Finished crawling");
};

module.exports = startProcess;
