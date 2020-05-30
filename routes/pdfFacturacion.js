var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var UsoCFDI = require('../models/facturacion/uso-CFDI');
var ClaveUnidad = require('../models/facturacion/claveUnidad');
var funcion = require('../routes/fuctions');
var MetodoPago = require('../models/facturacion/metodo-pago');
// ===========================================
//  OBTINE EL USO DE CADA FACTURA 
// ===========================================

app.get('/uso/:uso', (req, res, next) => {
    var uso = req.query.uso || '';
    var filtro = '{';
    if (uso != 'undefined' && uso != '')
        filtro += '\"usoCFDI\":' + '\"' + uso + '\"' + '}';

    var json = JSON.parse(filtro);
    UsoCFDI.find(json)
        .exec((err, uso) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar UsoCFDI',
                    errors: { mensage: 'Error al buscar UsoCFDI' }
                });
            }
            res.status(200).json({
                ok: true,
                usoCFDI: uso
            });
        });
});

// ===========================================
//  OBTINE EL METODO PAGO DE CADA FACTURA 
// ===========================================
app.get('/metodoPago/:metodoPago', (req, res) => {
    let metod = req.query.metodoPago || '';
    let filtro = '{';
    if (metod !== undefined && metod !== '') {
        filtro += '\"metodoPago\":' + '\"' + metod + '\"' + '}';
    }
    let json = JSON.parse(filtro);
    MetodoPago.find(json).exec((err, metodo) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Metodo Pago',
                errors: { message: 'Error al buscar Metodo Pago' }
            });
        }
        res.status(200).json({
            ok: true,
            MetodoPago: metodo
        });
    });
});

// ===========================================
//  OBTINE EL CLAVE UNIDAD DE CADA FACTURA 
// ===========================================

app.get('/clave/unidad/:unidad', (req, res, next) => {
    var unidad = req.params.unidad || '';
    var filtro = '{';
    if (unidad != 'undefined' || unidad != '') {
        filtro += '\"claveUnidad\":' + '\"' + unidad + '\"' + '}';
    }
    var json = JSON.parse(filtro);
    ClaveUnidad.find(json).exec((err, clave) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar clave Unidad',
                errors: { mensage: 'Error al buscar clave Unidad' }
            });
        }
        res.status(200).json({
            ok: true,
            claveUnidad: clave
        });
    });
});

// ===========================================
//  OBTINE EN LETRAS EL TOTAL
// ===========================================
app.get('/numerosLetras/:total', (req, res) => {
    var total = req.params.total;

    if (total === undefined || total === '') {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al convertir Numero a Letras',
            errors: { message: 'Error al convertir Numero a Letras' }
        });
    } else {
        var letra = funcion.numeroALetras(total, {
        });

        var centavos = total.indexOf('.')
        if (centavos !== -1) {
            var punto = total.toString().split('.');
            centavos = punto[1].padStart(2, '0');
        } else {
            centavos = '00'
        }

        letra = `${letra}   ${centavos}/100 M.N.`

        res.status(200).json({
            ok: true,
            numeroLetras: letra
        });
    }
});




module.exports = app;