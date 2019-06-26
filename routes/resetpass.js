// Requires
var express = require('express');

// Inicializar variables
var app = express();

var mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcryptjs'),
    Usuario = require('../models/usuario'),
    path = require('path'),
    async = require('async'),
    crypto = require('crypto'),
    _ = require('lodash'),
    hbs = require('nodemailer-express-handlebars'),
    email = process.env.MAILER_EMAIL_ID || 'emirpalm@gmail.com',
    pass = process.env.MAILER_PASSWORD || 'boryitbsckzmaczr',
    nodemailer = require('nodemailer');


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

smtpTransport.use('compile', hbs(handlebarsOptions));


// Rutas
app.get('/', (req, res) => {
    return res.sendFile(path.resolve('./public/reset-password.html'));
});

app.post('/', (req, res, next) => {
    Usuario.findOne({
        reset_password_token: req.body.token,
        reset_password_expires: {
            $gt: Date.now()
        }
    }).exec((err, user) => {
        if (!err && user) {
            if (req.body.newPassword === req.body.verifyPassword) {
                user.password = bcrypt.hashSync(req.body.newPassword, 10);
                user.reset_password_token = undefined;
                user.reset_password_expires = undefined;
                user.save((err) => {
                    if (err) {
                        return res.status(422).send({
                            message: err,
                            errors: err
                        });
                    } else {
                        var data = {
                            to: user.email,
                            from: email,
                            template: 'reset-password-email',
                            subject: 'Confirmación de contraseña restablecida',
                            context: {
                                name: user.nombre.split(' ')[0]
                            }
                        };

                        smtpTransport.sendMail(data, (err) => {
                            if (!err) {
                                return res.json({ message: 'Contraseña Restablecida' });
                            } else {
                                return done(err);
                            }
                        });
                    }
                });
            } else {
                return res.status(422).send({
                    message: 'Las contraseñas no coinciden'
                });
            }
        } else {
            return res.status(400).send({
                message: 'El token de restablecimiento de contraseña no es válido o ha caducado.'
            });
        }
    });
});

// export
module.exports = app;