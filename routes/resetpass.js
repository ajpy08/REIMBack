// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
const passGmail = require('../config/config').passGmail;

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
    // email = process.env.MAILER_EMAIL_ID || 'jpuc@tlreim.com.mx',
    // pass = process.env.MAILER_PASSWORD || 'tlreimjpuc#1',
    // nodemailer = require('nodemailer');
    email = process.env.MAILER_EMAIL_ID || 'patiocontenedoresreim@gmail.com',
    pass = process.env.MAILER_PASSWORD || passGmail,
    nodemailer = require('nodemailer');


var smtpTransport = nodemailer.createTransport({
     service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
    //service: process.env.MAILER_SERVICE_PROVIDER || '187.210.87.53',
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

app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_o_MismoUsuario], (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        usuario.password =  bcrypt.hashSync(body.password, 10),
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al cambiar la contraseña',
                    errors: err
                });
            }
            usuarioGuardado.password = '=)';
            res.status(200).json({
                ok: true,
                mensaje: 'Contraseña Actualizada con éxito',
                usuario: usuarioGuardado
            });
        });
    });
});


// export
module.exports = app;