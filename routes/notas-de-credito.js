var express = require('express');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var tipoRelacion = require('../models/facturacion/tipoRelacion');


app.get('/', mdAutenticacion.verificaToken, (req, res) => {
    tipoRelacion.find().exec((err, tipoRelacion) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al cargar Tipo Relacion',
                errors: err
            });
        }
        return res.status(200).json({
            ok: true,
            tipoRelacion: tipoRelacion
        });
    });
});

module.exports = app;