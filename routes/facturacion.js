var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var ClaveSAT = require('../models/facturacion/claveSAT');
var ClaveUnidad = require('../models/facturacion/claveUnidad');
var app = express();

// // ==========================================
// // Obtener todas las Claves SAT
// // ==========================================
app.get('/clavesSAT', (req, res, next) => {
    ClaveSAT.find({})
        .sort({ claveProdServ: 1 })
        .limit(100)
        .exec((err, clavesSAT) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar claves SAT',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                clavesSAT: clavesSAT,
                total: clavesSAT.length
            });
        });
});

// // ==========================================
// // Obtener todas las Claves Unidad
// // ==========================================
app.get('/clavesUnidad', (req, res, next) => {
    ClaveUnidad.find({})
        .sort({ nombre: 1 })
        .limit(100)
        .exec((err, clavesUnidad) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar Claves Unidad',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                clavesUnidad: clavesUnidad,
                total: clavesUnidad.length
            });
        });
});

module.exports = app;