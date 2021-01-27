
let nodemailer = require('nodemailer');

let myemail = 'mediacatut@gmail.com'
  
let mailOptions = {
    from: myemail,
    to: myemail,
    subject: 'The crawler has stopped',
    text: 'Email to let you know that the crawler has stopped crawling'
  };


let mailError = {
    from: myemail,
    to: myemail,
    subject: 'The crawler has stopped with an error',
    text: 'Email to let you know that the crawler has stopped crawling with an error'
  };

module.exports = {
    mailOptions,
    mailError
};