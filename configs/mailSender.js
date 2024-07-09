const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const mailSender = async (email, subject, text, attachmentPath) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_PORT == 465,
      auth: {
        user: process.env.USER1,
        pass: process.env.PASS,
      },
      logger: true,
      debug: true,
    });

    let mailOptions = {
      from: `"verify" <${process.env.USER1}>`,
      to: email,
      subject: subject,
      html: `<p>${text}</p>`,
    };

    if (attachmentPath) {
      mailOptions.attachments = [
        {
          filename: path.basename(attachmentPath),
          path: attachmentPath,
        },
      ];
    }

    let info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(error);
  }
};

module.exports = mailSender;
