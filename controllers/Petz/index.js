const Puppeteer = require("puppeteer");

const url = "https://www.cobasi.com.br/";

const getWeb = async (userAgent) => {
  const browser = await Puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(userAgent);
  await page.goto(url);
};

const startProcess = (userAgent) => {
  getWeb(userAgent);
};

module.exports = startProcess;
