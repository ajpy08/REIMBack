
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const passGmail = require('../config/config').passGmail;
// email = process.env.MAILER_EMAIL_ID || 'noreply@tlreim.com.mx',
// pass = process.env.MAILER_PASSWORD || 'tlreimjpuc#1',
const email = process.env.MAILER_EMAIL_ID || 'patiocontenedoresreim@gmail.com';
const pass = process.env.MAILER_PASSWORD || passGmail;
const nodemailer = require('nodemailer');

module.exports = (nombreReceptor, correoReceptor, asunto, cuerpo, template, url, arch, archivos) => {
    let ok = true
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

    if (arch === true) {
        const pdf = `${archivos[1]}`;
        const xml = `${archivos[0]}`;

        var data = {
            to: correoReceptor,
            from: email,
            template: template,
            subject: asunto,
            attachments: [
                {
                    filename: pdf,
                    path: path.resolve(__dirname, `../archivosTemp/${pdf}`),
                    contentType: 'application/pdf'
                },
                {
                    filename: xml,
                    path: path.resolve(__dirname, `../archivosTemp/${xml}`),
                    ccontentType: 'application/xml'
                }
            ],
            context: {
                subject: asunto,
                body: cuerpo,
                name: nombreReceptor,
                url: url
            }
        };
    } else {
        var data = {
            to: correoReceptor,
            from: email,
            template: template,
            subject: asunto,
            // attachments: [
            //     {   // utf-8 string as an attachment
            //         filename: 'text1.txt',
            //         content: 'hello world!'
            //     }
            // //     // {   // binary buffer as an attachment
            // //     //     filename: 'text2.txt',
            // //     //     content: new Buffer('hello world!','utf-8')
            // //     // },
            // //     // {   // file on disk as an attachment
            // //     //     filename: 'text3.txt',
            // //     //     path: '/path/to/file.txt' // stream this file
            // //     // }
            // ],
            context: {
                subject: asunto,
                body: cuerpo,
                name: nombreReceptor,
                url: url
            }
        };
    }

    smtpTransport.sendMail(data, (error, info) => {
        if (!error) {
            return ok
        } else {
            ok = false
            console.log(error);
            return ok
        }
    });
}