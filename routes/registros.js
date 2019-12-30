var express = require('express');
var app = express();
var Registro = require('../models/registro');

// ==========================================
// Crear nuevo Registro
// ==========================================

app.post('/registro',(req, res) => {
    var body = req.body;
    var registro  = new Registro({
        role: body.role,
        razonSocial: body.razonSocial, 
        rfc: body.rfc,
        direccionFiscal: body.direccionFiscal,
        // correo: body.correo,
        // nombre: body.nombre,
        datosPersonales: body.datosPersonales,  
        correoFacturacion: body.correoFacturacion, 
        correoOperativo: body.correoOperativo, 
        correoO: body.correoO,
        codigo: body.codigo
    });
    registro.save((err, registroGuardado) =>{
        if(err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al registrar usuario',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            registro: registroGuardado
        });
    });
});

module.exports = app;