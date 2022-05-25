let nodemailer = require("nodemailer");
require("dotenv").config();

function sendEmail(emailContent, transporter) {
  return transporter.sendMail(emailContent);
}

function initEmail() {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "mediacatutsc@gmail.com",
      pass: process.env.PASS,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });

  return transporter;
}

let mailCrawlEnd = function (recipients) {
  const transporter = initEmail();
  let crawlEnd = {
    from: "mediacatutsc@gmail.com",
    to: recipients,
    subject: "The crawler has stopped with all request finished",
    text: "Email to let you know that the crawler has stopped crawling",
  };
  return sendEmail(crawlEnd, transporter);
};

let mailCrawlError = function (recipients) {
  const transporter = initEmail();
  let crawlError = {
    from: "mediacatutsc@gmail.com",
    to: recipients,
    subject: "The crawler has stopped due to too much error",
    text: "Email to let you know that the crawler has stopped crawling due to too much error",
  };
  return sendEmail(crawlError, transporter);
};

module.exports = { mailCrawlEnd, mailCrawlError };
