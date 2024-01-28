
// const nodemailer = require("nodemailer");

// const { UKR_NET_PASSWORD, UKR_NET_EMAIL } = process.env;

// const nodemailerConfig = {
//   host: "smtp.ukr.net",
//   port: 465,
//   secure: true,
//   auth: {
//     user: UKR_NET_EMAIL,
//     pass: UKR_NET_PASSWORD,
//   },
// };

// const transport = nodemailer.createTransport(nodemailerConfig);

// const sendEmail = (data) => {
//   const email = { ...data, from: UKR_NET_EMAIL };
//   return transport.sendMail(email);
// };

// module.exports = sendEmail;
const nodemailer = require("nodemailer");
const path = require("path");
const pug = require("pug");

const { convert } = require("html-to-text");
// const { serverConfig } = require("../config");

require("dotenv").config({
  path: path.join(__dirname, "../env/development.env"),
});

const { MAILTRAP_USER, MAILTRAP_PASS } = process.env;

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = process.env.emailFrom;
  }

  _initTransport() {
    return nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: MAILTRAP_USER,
        pass: MAILTRAP_PASS,
      },
    });
  }

  async _send(template, subject) {
    try {
      const templatePath = path.join(__dirname, "../view", `${template}.pug`);
      const html = pug.renderFile(templatePath, {
        name: this.name,
        url: this.url,
        subject,
      });

      const emailConfig = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html),
      };

      await this._initTransport().sendMail(emailConfig);
      console.log("✅ email sent successfully");
    } catch (error) {
      console.error("❌ email sending error:", error.message);
      throw error;
    }
  }

  async sendVerification() {
    await this._send("verification", "Verification mail");
  }
}

module.exports = Email;