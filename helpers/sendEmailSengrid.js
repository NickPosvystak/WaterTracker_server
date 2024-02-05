const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const path = require("path");
const pug = require("pug");

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
  const { to, subject, template } = data;

  const templatePath = path.join(__dirname, "../view", `${template}.pug`);
  const html = pug.renderFile(templatePath, data);

  const email = {
    to,
    from: "tunnickliffe@gmail.com",
    subject,
    html,
  };

  await sgMail.send(email);
  return true;
};

module.exports = sendEmail;

