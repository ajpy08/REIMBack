var express = require('express');
var app = express();
var CFDIS = require('../models/facturacion/cfdi');
var mdAutenticacion = require('../middlewares/autenticacion');
var tipoRelacion = require('../models/facturacion/tipoRelacion');
var moment = require('moment');
const cfdi = require('../models/facturacion/cfdi');


// ==========================================
// CARGAR TIPO RELACIÓN
// ==========================================
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

// ==========================================
// Crear nueva NOTA DE CREDITO
// ==========================================

app.post('/notas/', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;
    const notas = new CFDIS({
        fecha: body.fecha,
        folio: body.folio,
        formaPago: body.formaPago,
        metodoPago: body.metodoPago,
        moneda: body.moneda,
        serie: body.serie,
        subtotal: body.subtotal,
        tipoComprobante: body.tipoComprobante,
        total: body.total,
        nombre: body.nombre,
        rfc: body.rfc,
        usoCFDI: body.usoCFDI,
        direccion: body.direccion,
        correo: body.correo,
        conceptos: body.conceptosCFDI,
        totalImpuestosRetenidos: body.totalImpuestosRetenidos,
        totalImpuestosTrasladados: body.totalImpuestosTrasladados,
        sucursal: body.sucursal,
        fechaEmision: moment().format('YYYY-MM-DD HH:mm:ss'),
        usuarioAlta: req.usuario._id
    });
    for (const c of notas.conceptos) {
        CFDIS.findByIdAndUpdate(c.cfdis, { $set: { 'notaDeCreditoRelacionada': notas._id } }).then(cfdi => {
            console.log('ok agregado id nota a cfdi')
        }).catch(err => {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al agregar nota de credito relacionada a cfdi',
                errors: err
            });
        })

    }
    notas.save((err, notaGuardada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar Nota de Credito',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            nota: notaGuardada
        });
    });
});

module.exports = app;