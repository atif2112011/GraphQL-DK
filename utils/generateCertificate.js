const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const mailSender = require("../configs/mailSender");

// Function to wrap text
function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let testY = y;
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const testWidth = doc.widthOfString(testLine);

    if (testWidth > maxWidth && n > 0) {
      lines.push({ text: line, x, y: testY });
      line = words[n] + " ";
      testY += lineHeight;
    } else {
      line = testLine;
    }
  }
  lines.push({ text: line, x, y: testY });

  lines.forEach((line) => {
    doc.text(line.text, line.x, line.y);
  });

  return lines.length * lineHeight;
}

async function generateCertificate(internDetails) {
  const { userId, internId, startDate, endDate, userEmail, title, greetings } =
    internDetails;
  console.log(userEmail);

  try {
    // Create a new PDF document
    const doc = new PDFDocument({
      size: [1655, 2340],
      margin: 0,
    });

    const outputPath = path.resolve(__dirname, `${title}_${userId}.pdf`);
    const templatePath = path.resolve(__dirname, "certificate.jpg");
    const sign = path.resolve(__dirname, "sign.png");

    // Pipe the PDF into a writable stream
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Load and draw the background image
    doc.image(templatePath, 0, 0, { width: 1655, height: 2340 });
    doc.image(sign, 230, 2050, { width: 180, height: 60 });

    // Customize text settings
    doc
      .fontSize(60)
      .font(path.resolve(__dirname, "./fonts/montserrat.bold.ttf"))
      .text(title, 480, 550);

    doc
      .fontSize(45)
      .font(path.resolve(__dirname, "./fonts/Calibri Regular.ttf"))
      .text(greetings, 90, 670);

    doc
      .fontSize(50)
      .font(path.resolve(__dirname, "./fonts/Calibri Regular.ttf"))
      .text(internId.name, 90, 730);

    doc.fontSize(40).text("Date:", 1260, 660);
    doc.text(new Date().toLocaleDateString(), 1360, 660);

    doc
      .fontSize(49)
      .font(path.resolve(__dirname, "./fonts/Calibri Regular.ttf"));

    const paragraph1 = `We are thrilled to offer you an internship opportunity at DURBHASHI GURUKULAM in the role of ${
      internId.techStack
    }, commencing on ${startDate.toLocaleDateString()}. Congratulations on securing this position—it's fantastic to have you on board! We are pleased to extend to you an offer of employment with DURBHASHI GURUKULAM for a period of six months, concluding on ${endDate.toLocaleDateString()}.`;
    const maxWidth = 1655 - 60;
    const lineHeight = 65;
    let yPosition = 850;
    let xPosition = 60;
    const paragraph1Height = wrapText(
      doc,
      paragraph1,
      xPosition,
      yPosition,
      maxWidth,
      lineHeight
    );

    // Starting y position for paragraph2
    yPosition += paragraph1Height + lineHeight;

    const paragraph2 = `At DURBHASHI GURUKULAM, we see internships as educational opportunities for skill development, not just jobs. This internship promises hands-on learning, allowing you to apply theoretical knowledge to practical scenarios.`;
    const paragraph2Height = wrapText(
      doc,
      paragraph2,
      xPosition,
      yPosition,
      maxWidth,
      lineHeight
    );

    yPosition += paragraph2Height + lineHeight;

    const paragraph3 = `Throughout your internship, you'll refine and showcase your skills, gaining a deeper understanding of the industry. By accepting this offer, you commit to diligently performing assigned tasks and following reasonable directives from your superiors.`;
    const paragraph3Height = wrapText(
      doc,
      paragraph3,
      xPosition,
      yPosition,
      maxWidth,
      lineHeight
    );

    yPosition += paragraph3Height + lineHeight;

    const paragraph4 = `We're confident that your time here will be incredibly rewarding, equipping you with the skills and knowledge needed to excel in your future endeavors.`;
    wrapText(doc, paragraph4, xPosition, yPosition, maxWidth, lineHeight);

    doc
      .fontSize(40)
      .font(path.resolve(__dirname, "./fonts/montserrat.bold.ttf"))
      .text("CEO", 250, 2000);

    doc.text("Durbhasi Gurukulam", 100, 2100);

    doc.text("Supervisor", 1280, 1980);
    doc.text("Durbhasi Gurukulam", 1180, 2060);

    // End and close the PDF document
    doc.end();

    // Wait for the PDF to be fully written to the file
    writeStream.on("finish", async () => {
      console.log("PDF generation completed.");

      // Prepare email content
      const subject = "Your Internship Offer Letter";
      const text = `Dear ${internId.name},<br><br>
        Congratulations on being selected for the internship position at Durbhasi Gurukulam. Please find your offer letter attached.<br><br>
        Best regards,<br>
        Durbhasi Gurukulam`;

      // Send the email with the PDF attachment
      await mailSender(userEmail, subject, text, outputPath);
      console.log(`Email sent to ${userEmail} with the offer letter.`);
    });
  } catch (error) {
    console.error("Error generating or sending the certificate:", error);
  }
}

module.exports = generateCertificate;
