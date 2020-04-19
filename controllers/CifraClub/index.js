const Puppeteer = require("puppeteer");
const readline = require("../../helpers");
const fs = require("fs");
const googleDriveApi = require("../../services");

const url = "https://www.cifraclub.com.br/";

const getContent = async (page) => {
  const titleElement = await page.$(".t1");
  const titleContent = await page.evaluate(
    (elem) => elem.textContent,
    titleElement
  );
  const upperCaseTitle = titleContent.toUpperCase();

  const cifraElement = await page.$(".cifra_cnt.g-fix.cifra-mono pre");
  const cifraContent = await page.evaluate(
    (elem) => elem.textContent,
    cifraElement
  );

  const finalText = upperCaseTitle.concat(`\n\n${cifraContent}`);
  fs.appendFile("musicas.txt", finalText, function (err) {
    if (err) throw err;
    console.log("Saved!");
  });

  return finalText;
};

const searchMusic = async (browser, text, userAgent) => {
  console.log("> Started to crawl ", url);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(userAgent);
  await page.goto(url);
  await page.waitForSelector("#js-h-search");
  await page.click("#js-h-search");
  await page.keyboard.type(text);
  await page.click("#js-h-form > button");
  await page.waitForSelector(
    "#___gcse_0 > div > div > div > div.gsc-wrapper > div.gsc-resultsbox-visible > div > div > div.gsc-expansionArea > div:nth-child(1) > div.gs-webResult.gs-result > div.gsc-thumbnail-inside > div > a"
  );
  await page.click(
    "#___gcse_0 > div > div > div > div.gsc-wrapper > div.gsc-resultsbox-visible > div > div > div.gsc-expansionArea > div:nth-child(1) > div.gs-webResult.gs-result > div.gsc-thumbnail-inside > div > a"
  );

  return page;
};

const startProcess = async (userAgent) => {
  const text = await readline("> Digite o nome da musica? ");
  const browser = await Puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const searchedPage = await searchMusic(browser, text, userAgent);
  const musicContent = await getContent(searchedPage);
  await googleDriveApi.writeToDocument(
    "14OKso4fGKqW-m_VMhcpUGMNJVoZsQ3VlbKnIjZdiRSs", // PDF - Musicas
    musicContent
  );
  console.log(musicContent);

  await browser.close();
  console.log("> Finished crawling");
};

module.exports = startProcess;
