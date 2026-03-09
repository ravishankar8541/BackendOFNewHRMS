const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises; // better to use promises version

const generatePDF = async (data) => {
  const templatePath = path.join(__dirname, '../templates/offerLetter.ejs');

  // 1. Load Logo and convert to Base64
  let logoBase64 = "";
  try {
    const logoPath = path.join(__dirname, '../assets/blackLogo.png');
    const bitmap = await fs.readFile(logoPath);
    logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
  } catch (err) {
    console.error("LOGO ERROR: Ensure logo is at backend/assets/blackLogo.png", err);
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
    formattedSalary: Number(data.salary).toLocaleString('en-IN'),
    formattedJoiningDate: new Date(data.joiningDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    currentDate: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  });

  // Launch puppeteer with Render-friendly args
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',      // important in containers
      '--disable-gpu',                // often helps
      '--single-process'              // sometimes needed on low-memory instances
    ],
    headless: true,
    // You can add timeout if needed: timeout: 30000
  });

  try {
    const page = await browser.newPage();

    // Optional: set viewport if your template needs specific size
    // await page.setViewport({ width: 1920, height: 1080 });

    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // You can also do: await page.goto('data:text/html,' + encodeURIComponent(html), ...)

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      // dpi: 300,          // optional — higher quality
      // scale: 0.8,        // optional
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

module.exports = generatePDF;