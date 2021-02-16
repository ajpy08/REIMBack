
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const passGmail = require('../config/config').passGmail;
// email = process.env.MAILER_EMAIL_ID || 'noreply@tlreim.com.mx',
// pass = process.env.MAILER_PASSWORD || 'tlreimjpuc#1',
const email = process.env.MAILER_EMAIL_ID || 'patiocontenedoresreim@gmail.com';
const pass = process.env.MAILER_PASSWORD || passGmail;
const nodemailer = require('nodemailer');

// module.exports = (formulario) => {
module.exports = (datos, correoReceptor, asunto) => {
    var smtpTransport = nodemailer.createTransport({
        //service: process.env.MAILER_SERVICE_PROVIDER || '192.168.2.246',
        // host: '192.168.2.246',
        // port: 25,
        service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
        auth: {
            user: email, // Cambialo por tu email
            pass: pass // Cambialo por tu password
        }
    });

    var handlebarsOptions = {
        viewEngine: 'handlebars',
        viewPath: path.resolve('./templates/'),
        extName: '.html'
    };

    smtpTransport.use('compile', hbs(handlebarsOptions));

    var data = {
        to: correoReceptor,
        from: email,
        template: 'emailInventario',
        subject: asunto,
        context: {
            subject: asunto,
            name: nombreReceptor
        }
    };

    smtpTransport.sendMail(data, (error, info) => {
        if (!error) {
            console.log(info);
            //return res.json({ message: 'Email Enviado!' });
        } else {
            console.log(error);
            //return done(error);
        }
    });
}