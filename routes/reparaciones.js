var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Reparacion = require('../models/reparacion');

// ==========================================
// Obtener todas las reparaciones
// ==========================================
app.get('/', (req, res, next) => {

  Reparacion.find({})
    .populate('usuarioAlta', 'nombre email')
    .sort({ descripcion: 1 })
    .exec(
      (err, reparaciones) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar reparaciones',
            errors: err
          });
        }

        res.status(200).json({
          ok: true,
          reparaciones: reparaciones,
          total: reparaciones.length
        });
      });
});

// ==========================================
//  Obtener Reparaciones por ID
// ==========================================
app.get('/reparacion/:id', (req, res) => {
  var id = req.params.id;
  Reparacion.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, reparacion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar la reparacion',
          errors: err
        });
      }
      if (!reparacion) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La reparacion con el id ' + id + 'no existe',
          errors: { message: 'No existe una reparacion con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        reparacion: reparacion
      });
    });
});

// ==========================================
// Crear nueva reparacion
// ==========================================
app.post('/reparacion', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var reparacion = new Reparacion({
    descripcion: body.descripcion,
    costo: body.costo,
    usuarioAlta: req.usuario._id
  });
  reparacion.save((err, reparacionGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear reparacion',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      reparacion: reparacionGuardado
    });
  });
});

// ==========================================
// Actualizar reparacion
// ==========================================
app.put('/reparacion/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Reparacion.findById(id, (err, reparacion) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar reparacion',
        errors: err
      });
    }
    if (!reparacion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El reparacion con el id ' + id + ' no existe',
        errors: { message: 'No existe reparacion con ese ID' }
      });
    }

    reparacion.descripcion = body.descripcion;
    reparacion.costo = body.costo;
    reparacion.usuarioMod = req.usuario._id;
    reparacion.fMod = new Date();
    reparacion.save((err, reparacionGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar reparacion',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        reparacion: reparacionGuardado
      });
    });
  });
});

// ============================================
//   Borrar reparacion por el id
// ============================================
app.delete('/reparacion/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Reparacion.findByIdAndRemove(id, (err, reparacionBorrada) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar reparacion',
        errors: err
      });
    }
    if (!reparacionBorrada) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe reparacion con ese id',
        errors: { message: 'No existe reparacion con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      reparacion: reparacionBorrada
    });
  });
});

module.exports = app;