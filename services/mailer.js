const nodemailer = require("nodemailer");
const gethtml = require("../Templates");

const sendMail = (to, subject, htmlKey, data) => {
  // Create a Nodemailer transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: to,
    subject: subject,
    html: gethtml(htmlKey, data),
  };
  // Send email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendMail;
