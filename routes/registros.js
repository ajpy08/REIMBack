var express = require('express');
var app = express();
var Registro = require('../models/registro');
const sentMail = require('../routes/sendAlert');
var SEED = require('../config/config').SEED;
var variasBucket = require('../public/variasBucket');
var correosTI = require('../config/config').correosTI;

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


// ===============================================
//  ENVIO DE CORREO REGISTRO
// ===============================================

app.get('/registro/:id/enviocorreo', (req, res) => {
    var id = req.params.id;
    var body = req.body;
     Registro.findById(id)
    .exec((err, registros) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar registrop',
                errors: err
            });
        }
        if (!registros) {
            return res.status(400).json ({
                ok: false,
                mensaje: 'El registro con el id ' + id + ' no existe',
                errors: { message: 'No existe registro con ese ID'}
            });
        } else {
            if (registros.id) {

                var cuerpoCorreo = ` `

                if (registros.direccionFiscal) {
                    cuerpoCorreo += `DIRECCION:  ${registros.direccionFiscal}  `
                }
                if (registros.role) {
                    cuerpoCorreo += `ROLE: ${registros.role} `;
                }
                cuerpoCorreo += `
            
                `;

                if (registros.razonSocial) {
                    cuerpoCorreo += `Razon Social: ${registros.razonSocial} `;
                }
                cuerpoCorreo += `
            
                `;

                if (registros.rfc) {
                    cuerpoCorreo += `RFC: ${registros.rfc}`;
                }
                cuerpoCorreo += `
            
                `;

                if (registros.role === 'TRANSPORTISTA_ROLE') {
                    if (registros.codigo) {
                        cuerpoCorreo += `CAT: 
                        ${registros.codigo}`;
                    }
                } else {
                   if (registros.codigo) {
                       cuerpoCorreo += `PATENTE: 
                       ${registros.codigo} `;
                   }
                }

                registros.correoFacturacion.forEach(c => {
                    
                    if (c.correoF) {
                        cuerpoCorreo += `CORREO FACTURACION: 
                         ${c.correoF}, `;
                    }
                });
                registros.correoOperativo.forEach(cO => {
                    
                    if (cO.correoO) {
                        cuerpoCorreo += `CORREO OPERATIVO:  
                        ${cO.correoO}, `;
                    }
                }); 

                registros.datosPersonales.forEach(cP => {
                    
                    if (cP.correo) {
                        cuerpoCorreo += `CORREO  ${cP.correo},
                         NOMBRE:  ${cP.nombre} `;
                    }
                });
                     
                sentMail(correosTI,correosTI,'REGISTRO NUEVO', cuerpoCorreo, 'registro', null);

                registros.save((err, registroenviado) => {
                    res.status(200).json ({
                        ok: true,
                        mensaje: 'enviado',
                        registro: registroenviado
                    });
                });
            }
        }
    });
});
module.exports = app;