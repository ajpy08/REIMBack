var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var CFDI = require('../models/facturacion/cfdi');

// ==========================================
// Obtener todos los CFDIS
// ==========================================
app.get('/', (req, res, next) => {
  CFDI.find({})
    // .populate('claveSAT', 'claveProdServ descripcion')
    // .populate('unidadSAT', 'claveUnidad nombre')
    .sort({ serie: 1, folio: 1 })
    .exec((err, cfdis) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar CFDIs',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        cfdis: cfdis,
        total: cfdis.length
      });
    });
});

// ==========================================
//  Obtener CFDI por ID
// ==========================================
app.get('/cfdi/:id', (req, res) => {
  var id = req.params.id;
  CFDI.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, cfdi) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el cfdi',
          errors: err
        });
      }
      if (!cfdi) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El CFDI con el id ' + id + 'no existe',
          errors: { message: 'No existe un CFDI con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        cfdi: cfdi
      });
    });
});


// ==========================================
// Crear nuevo CFDI
// ==========================================
app.post('/cfdi/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var cfdi = new CFDI({
    fecha: body.fecha,
    folio: body.folio,
    formaPago: body.formaPago,
    // lugarExpedicion: body.lugarExpedicion,
    metodoPago: body.metodoPago,
    moneda: body.moneda,
    serie: body.serie,
    subtotal: body.subtotal,
    tipoComprobante: body.tipoComprobante,
    total: body.total,
    // version:  body.version,
    // noCertificado: body.noCertificado,
    // sello: body.sello,
    // certificado: body.certificado,

    // nombreEmisor: body.certificado,
    // regimenFiscal: body.regimenFiscal,
    // rfcEmisor: body.rfcEmisor,

    nombre: body.nombre,
    rfc: body.rfc,
    usoCFDI: body.usoCFDI,
    direccion: body.direccion,
    correo: body.correo,
    conceptos: body.conceptos,
    totalImpuestosRetenidos: body.totalImpuestosRetenidos,
    totalImpuestosTrasladados: body.totalImpuestosTrasladados,
    sucursal: body.sucursal,
    usuarioAlta: req.usuario._id
  });
  cfdi.save((err, cfdiGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear el CFDI',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      cfdi: cfdiGuardado
    });
  });
});

// ==========================================
// Actualizar CFDI
// ==========================================
app.put('/cfdi/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  CFDI.findById(id, (err, cfdi) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el CFDI',
        errors: err
      });
    }
    if (!cfdi) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El CFDI con el id ' + id + ' no existe',
        errors: { message: 'No existe CFDI con ese ID' }
      });
    }

    cfdi.serie = body.serie,
      cfdi.folio = body.folio,
      cfdi.sucursal = body.sucursal,
      cfdi.formaPago = body.formaPago,
      cfdi.metodoPago = body.metodoPago,
      cfdi.moneda = body.moneda,
      cfdi.tipoComprobante = body.tipoComprobante,
      cfdi.fecha = body.fecha,
      cfdi.rfc = body.rfc,
      cfdi.nombre = body.nombre,
      cfdi.usoCFDI = body.usoCFDI,
      cfdi.direccion = body.direccion,
      cfdi.correo = body.correo,
      cfdi.conceptos = body.conceptos,
      cfdi.usuarioMod = req.usuario._id;
    cfdi.fMod = new Date();

    cfdi.save((err, cfdiGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el CFDI',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        cfdi: cfdiGuardado
      });
    });
  });
});

// ============================================
//   Borrar CFDI por ID
// ============================================
app.delete('/cfdi/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  CFDI.findByIdAndRemove(id, (err, cfdiBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar CFDI',
        errors: err
      });
    }
    if (!cfdiBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe CFDI con ese ID',
        errors: { message: 'No existe CFDI con ese ID' }
      });
    }
    res.status(200).json({
      ok: true,
      cfdi: cfdiBorrado
    });
  });
});
module.exports = app;