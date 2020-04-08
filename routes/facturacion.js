var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var ClaveSAT = require('../models/facturacion/claveSAT');
var ClaveUnidad = require('../models/facturacion/claveUnidad');
var Serie = require('../models/facturacion/serie');
var RegimenFiscal = require('../models/facturacion/regimenFiscal');
var FormaPago = require('../models/facturacion/forma-pago');
var TipoComprobante = require('../models/facturacion/tipo-comprobante');
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

// // ==========================================
// // Obtener todas las Series
// // ==========================================
app.get('/series', (req, res, next) => {
    Serie.find({})
        .populate('regimenFiscal', 'claveRegimenFiscal descripcion Fisica Moral')
        .sort({ serie: 1 })
        .exec((err, series) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar Series',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                series: series,
                total: series.length
            });
        });
});

// // ==========================================
// // Obtener todos los regimenes fiscales
// // ==========================================
app.get('/regimenes-fiscales', (req, res, next) => {
    RegimenFiscal.find({})
        .sort({ claveRegimenFiscal: 1 })
        .exec((err, regimenes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar regimenes',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                regimenes: regimenes,
                total: regimenes.length
            });
        });
});

// // ==========================================
// // Obtener todas las formas de pago
// // ==========================================
app.get('/formas-pago', (req, res, next) => {
    FormaPago.find({})
        .sort({ formaPago: 1 })
        .exec((err, formasPago) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar formas de pago',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                formasPago: formasPago,
                total: formasPago.length
            });
        });
});

// // ==========================================
// // Obtener todas los Tipos de Comprobante
// // ==========================================
app.get('/tipos-comprobante', (req, res, next) => {
    TipoComprobante.find({})
        .sort({ descripcion: 1 })
        .exec((err, tiposComprobante) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar tipos de comprobante',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                tiposComprobante: tiposComprobante,
                total: tiposComprobante.length
            });
        });
});

module.exports = app;