var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var ClaveUnidad = require('../models/facturacion/claveUnidad');


// ==========================================
// Obtener todas las claves unidad
// ==========================================

app.get('/',  mdAutenticacion.verificaToken, (req, res, next) => {
    ClaveUnidad.find({})
        .exec((err, clave_unidad) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar Productos o Servicios',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                clave_unidad: clave_unidad,
                total: clave_unidad.length
            });
        });
});


// ==========================================
//  Obtener CLAVE UNIDAD por ID
// ==========================================
app.get('/clave-unidad/:id',  mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    ClaveUnidad.findById(id)
      .exec((err, clave_unidad) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar el clave_unidad',
            errors: err
          });
        }
        if (!clave_unidad) {
          return res.status(400).json({
            ok: false,
            mensaje: 'El clave_unidad con el id ' + id + 'no existe',
            errors: { message: 'No existe un clave_unidad con ese ID' }
          });
        }
        res.status(200).json({
          ok: true,
          clave_unidad: clave_unidad
        });
      });
  });

// ==========================================
// Crear nueva CLAVE UNIDAD
// ==========================================
app.post('/clave-unidad/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var clave_unidad = new ClaveUnidad({
    claveUnidad: body.claveUnidad,
    nombre: body.nombre,
    descripcion: body.descripcion,
    nota: body.nota
  });
  clave_unidad.save((err, clave_unidadGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear clave unidad',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      clave_unidad: clave_unidadGuardado
    });
  });
});

// ==========================================
// Actualizar CLAVE UNIDAD
// ==========================================
app.put('/clave-unidad/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    ClaveUnidad.findById(id, (err, clave_unidad) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar clave unidad',
          errors: err
        });
      }
      if (!clave_unidad) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El producto o servicio con el id ' + id + ' no existe',
          errors: { message: 'No existe clave unidad con ese ID' }
        });
      }
  
      clave_unidad.claveUnidad = body.claveUnidad,
      clave_unidad.nombre = body.nombre,
      clave_unidad.descripcion = body.descripcion,
      clave_unidad.nota = body.nota,

  
      clave_unidad.save((err, clave_unidadGuardado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar clave_unidad',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          clave_unidad: clave_unidadGuardado
        });
      });
    });
  });


  // ============================================
//   Borrar buques por el id
// ============================================
app.delete('/clave-unidad/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    ClaveUnidad.findByIdAndRemove(id, (err, clave_unidadBorrado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al borrar clave unidad',
          errors: err
        });
      }
      if (!clave_unidadBorrado) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No existe clave unidad con ese id',
          errors: { message: 'No existe clave unidad con ese id' }
        });
      }
      res.status(200).json({
        ok: true,
        clave_unidad: clave_unidadBorrado
      });
    });
  });
  

module.exports = app;