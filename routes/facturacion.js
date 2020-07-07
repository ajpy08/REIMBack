var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var ClaveSAT = require('../models/facturacion/claveSAT');
var ClaveUnidad = require('../models/facturacion/claveUnidad');
var Serie = require('../models/facturacion/serie');
var RegimenFiscal = require('../models/facturacion/regimenFiscal');
var FormaPago = require('../models/facturacion/forma-pago');
var MetodoPago = require('../models/facturacion/metodo-pago');
var TipoComprobante = require('../models/facturacion/tipo-comprobante');
var UsoCFDI = require('../models/facturacion/uso-CFDI');
var Maniobra = require('../models/maniobra');
var app = express();

// // ==========================================
// // Obtener todas las Claves SAT
// // ==========================================
app.get('/clavesSAT',  mdAutenticacion.verificaToken, (req, res, next) => {
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
app.get('/clavesUnidad',  mdAutenticacion.verificaToken, (req, res, next) => {
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
app.get('/series',  mdAutenticacion.verificaToken,  (req, res, next) => {
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

// ==========================================
//  Obtener Serie por Serie
// ==========================================
app.get('/series/:serie', mdAutenticacion.verificaToken, (req, res) => {
  var serie = req.params.serie;

  Serie.find({ serie: serie })
    .exec((err, serie) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar serie',
          errors: err
        });
      }
      if (!serie) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La serie ' + serie + ' no existe',
          errors: { message: 'No existe una serie con ' + serie }
        });
      }
      res.status(200).json({
        ok: true,
        serie: serie[0],
        // total: serie.length
      });
    });
});

// ==========================================
// Obtener todos los regimenes fiscales
// ==========================================
app.get('/regimenes-fiscales', mdAutenticacion.verificaToken,  (req, res, next) => {
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

// ==========================================
// Obtener todas las formas de pago
// ==========================================
app.get('/formas-pago', mdAutenticacion.verificaToken,  (req, res, next) => {
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

// ==========================================
//Obtener todas los metodos de pago
//==========================================
app.get('/metodos-pago', mdAutenticacion.verificaToken,  (req, res, next) => {
  MetodoPago.find({})
    .sort({ metodoPago: 1 })
    .exec((err, metodosPago) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar metodos de pago',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        metodosPago: metodosPago,
        total: metodosPago.length
      });
    });
});

// ==========================================
// Obtener todas los Tipos de Comprobante
// ==========================================
app.get('/tipos-comprobante', mdAutenticacion.verificaToken,  (req, res, next) => {
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

// ==========================================
// Obtener todas los Tipos de Comprobante
// ==========================================
app.get('/usos-CFDI', mdAutenticacion.verificaToken,  (req, res, next) => {
  UsoCFDI.find({})
    .sort({ usoCFDI: 1 })
    .exec((err, usosCFDI) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar usos de CFDI',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        usosCFDI: usosCFDI,
        total: usosCFDI.length
      });
    });
});

// ============================================
//   Borrar MANIOBRA DE CONCEPTOS INDIVIDUAL
// ============================================

app.get('/deleteConceptoManiobra/:cfdi&:maniobra&:concepto', mdAutenticacion.verificaToken,  (req, res, next) => {
  let maniobra = req.params.maniobra,
    cfdi = req.params.cfdi,
    concepto = req.params.concepto;
  Maniobra.updateMany({ '_id': maniobra }, { $pull: { 'cfdisAsociados':{'id_Cfdi': cfdi, 'id_Concepto': concepto} } }, (err) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al borrar CFDI Asociado con el id' + cfdi + ' de la maniobra ' + maniobra,
        errors: { message: 'Error al borrar CFDI Asociado con el id' + cfdi + ' de la maniobra ' + maniobra }
      });
    }
    res.status(200).json({
      ok: true
    });

  });
});

module.exports = app;