var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var UsoCFDI = require('../models/facturacion/uso-CFDI');
var ClaveUnidad = require('../models/facturacion/claveUnidad');

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
                errors: {mensage: 'Error al buscar clave Unidad'}
            });
        }
        res.status(200).json({
            ok: true,
            claveUnidad: clave
        });
    });
});


module.exports = app;