
var path = require('path'),
    hbs = require('nodemailer-express-handlebars'),
    email = process.env.MAILER_EMAIL_ID || 'noreply@tlreim.com.mx',
    pass = process.env.MAILER_PASSWORD || 'tlreimjpuc#1',
    // email = process.env.MAILER_EMAIL_ID || 'patiocontenedoresreim@gmail.com',
    // pass = process.env.MAILER_PASSWORD || 'fmat*0348',
    nodemailer = require('nodemailer');

// module.exports = (formulario) => {
module.exports = (nombreReceptor, correoReceptor, asunto) => {
    var smtpTransport = nodemailer.createTransport({
        //service: process.env.MAILER_SERVICE_PROVIDER || '192.168.2.246',
        host: '192.168.2.246',
        port: 25,
        // service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
        // auth: {
        //     user: email, // Cambialo por tu email
        //     pass: pass // Cambialo por tu password
        // }
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
        template: 'emailAlert',
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

    // const mailOptions = {
    //     //  from: `”${formulario.nombre} 👻” <${formulario.email}>`,
    //     from: `notificaciones@tlreim.com.mx`,
    //     to: correoReceptor, // Cambia esta parte por el destinatario
    //     // subject: formulario.asunto,
    //     subject: asunto,
    //     // html: `
    //     //     <strong>Nombre:</strong> ${formulario.nombre} <br/>
    //     //     <strong>E-mail:</strong> ${formulario.email} <br/>
    //     //     <strong>Mensaje:</strong> ${formulario.mensaje}
    //     //       `
    //     html: `
    //         <img src="http://www.mieryteran.com.mx/imagenes/logo_reim_container_park.jpg" width="200" height="50"><br><br>
            
    //         Estimado <strong>${nombreReceptor}</strong> <br/><br/>
            
    //         Acabas de iniciar sesion en el sitio de REIM Container Park.
    //           `
    // };    

    // smtpTransport.sendMail(mailOptions, function (err, info) {
    //     if (err)
    //         console.log(err)
    //     else
    //         console.log(info);
    // });
}