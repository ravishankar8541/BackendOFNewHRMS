const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const generatePDF = async (data) => {

  const templatePath = path.join(__dirname, "../templates/offerLetter.ejs");

  let logoBase64 = "";

  try {
    const logoPath = path.join(__dirname, "../assets/blackLogo.png");
    const bitmap = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${bitmap.toString("base64")}`;
  } catch (err) {
    console.log("Logo not found");
  }

  const html = await ejs.renderFile(templatePath, {
    logo: logoBase64,
    ...data
  });

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true
  });

  await browser.close();

  return pdfBuffer;
};

module.exports = generatePDF;