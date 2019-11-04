var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Buque = require('../models/buque');

// ==========================================
// Obtener todos los buques
// ==========================================
app.get('/', (req, res, next) => {
  Buque.find({})
    .populate('naviera', 'razonSocial nombreComercial')
    .populate('usuarioAlta', 'nombre email')
    .sort({ nombre: 1 })
    .exec((err, buques) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar clientes',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        buques: buques,
        total: buques.length
      });
    });
});

// ==========================================
// Obtener todos los buques por naviera
// ==========================================
app.get('/naviera/:id', (req, res, next) => {
  var id = req.params.id;
  Buque.find({ naviera: id })
    .populate('naviera', 'naviera nombreComercial')
    .populate('usuario', 'nombre email')
    .sort({ nombre: 1 })
    .exec((err, buques) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar clientes',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        buques: buques,
        total: buques.length
      });

    });
});

// ==========================================
//  Obtener Buque por ID
// ==========================================
app.get('/buque/:id', (req, res) => {
  var id = req.params.id;
  Buque.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, buque) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el buque',
          errors: err
        });
      }
      if (!buque) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El buque con el id ' + id + 'no existe',
          errors: { message: 'No existe un buque con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        buque: buque
      });
    });
});

// ==========================================
// Crear nuevo buque
// ==========================================
app.post('/buque/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var buque = new Buque({
    nombre: body.nombre,
    naviera: body.naviera,
    usuarioAlta: req.usuario._id
  });
  buque.save((err, buqueGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear buque',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      buque: buqueGuardado
    });
  });
});

// ==========================================
// Actualizar Buque
// ==========================================
app.put('/buque/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Buque.findById(id, (err, buque) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar buque',
        errors: err
      });
    }
    if (!buque) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El buque con el id ' + id + ' no existe',
        errors: { message: 'No existe buque con ese ID' }
      });
    }

    buque.nombre = body.nombre;
    buque.naviera = body.naviera;
    buque.usuarioMod = req.usuario._id;
    buque.fMod = new Date();
    buque.save((err, buqueGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar buque',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        buque: buqueGuardado
      });
    });
  });
});

// ============================================
//   Borrar buques por el id
// ============================================
app.delete('/buque/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Buque.findByIdAndRemove(id, (err, buqueBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar buque',
        errors: err
      });
    }
    if (!buqueBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe buque con ese id',
        errors: { message: 'No existe buque con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      buque: buqueBorrado
    });
  });
});

module.exports = app;