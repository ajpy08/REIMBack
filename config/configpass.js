var nodemailer = require('nodemailer'),
    hbs = require('nodemailer-express-handlebars'),
    path = require('path'),
    email = process.env.MAILER_EMAIL_ID || 'patiocontenedoresreim@gmail.com',
    pass = process.env.MAILER_PASSWORD || 'fmat*0348';

var smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
    auth: {
        user: email,
        pass: pass
    }
});


var handlebarsOptions = {
    viewEngine: 'handlebars',
    viewPath: path.resolve('./templates/'),
    extName: '.html'
};