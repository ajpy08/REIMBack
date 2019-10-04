const nodemailer = require('nodemailer');

var email = process.env.MAILER_EMAIL_ID || 'patiocontenedoresreim@gmail.com',
    pass = process.env.MAILER_PASSWORD || 'fmat*0348';

// module.exports = (formulario) => {
module.exports = (nombreReceptor, correoReceptor, asunto) => {
    var transporter = nodemailer.createTransport({
        service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
        auth: {
            user: email, // Cambialo por tu email
            pass: pass // Cambialo por tu password
        }
    });
    const mailOptions = {
        //  from: `”${formulario.nombre} 👻” <${formulario.email}>`,
        from: `notificaciones@tlreim.com.mx`,
        to: correoReceptor, // Cambia esta parte por el destinatario
        // subject: formulario.asunto,
        subject: asunto,
        // html: `
        //     <strong>Nombre:</strong> ${formulario.nombre} <br/>
        //     <strong>E-mail:</strong> ${formulario.email} <br/>
        //     <strong>Mensaje:</strong> ${formulario.mensaje}
        //       `
        html: `
            <img src="http://www.mieryteran.com.mx/imagenes/logo_reim_container_park.jpg" width="200" height="50"><br><br>
            
            Estimado <strong>${nombreReceptor}</strong> <br/><br/>
            
            Acabas de iniciar sesion en el sitio de REIM Container Park.
              `
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}