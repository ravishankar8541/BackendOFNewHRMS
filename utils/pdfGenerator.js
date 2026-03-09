const puppeteer = require("puppeteer");
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
    offerId: data.offerId,
    employeeName: data.employeeName,
    fathersName: data.fathersName,
    address: data.address,
    phoneNumber: data.phoneNumber,
    emailId: data.emailId,
    position: data.position,
    salary: data.salary,
    hrName: data.hrName,
    formattedSalary: Number(data.salary).toLocaleString("en-IN"),
    formattedJoiningDate: new Date(data.joiningDate).toLocaleDateString("en-IN"),
    currentDate: new Date().toLocaleDateString("en-IN")
  });

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
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