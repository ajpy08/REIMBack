var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var UsoCFDI = require('../models/facturacion/uso-CFDI');

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



module.exports = app;