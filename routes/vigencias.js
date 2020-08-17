var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Vigencia = require('../models/vigencia');

// ==========================================
// Obtener todos las vigencias
// ==========================================
app.get('/:tf',  mdAutenticacion.verificaToken, (req, res) => {
    var tf = req.params.tf;
  
    Vigencia.find({ "activo": tf })
      .populate('usuarioAlta', 'nombre email')
      .sort({ contenedor: 1 })
      .exec((err, vigencias) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar vigencias',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          vigencias: vigencias,
          total: vigencias.length
        });
      });
  });

// ==========================================
//  Obtener Vigencia por ID
// ==========================================
app.get('/vigencia/:id',  mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Vigencia.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, vigencia) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar la vigencia',
          errors: err
        });
      }
      if (!vigencia) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La vigencia con el id ' + id + 'no existe',
          errors: { message: 'No existe una vigencia con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        vigencia: vigencia
      });
    });
});

// ==========================================
// Crear nueva Vigencia
// ==========================================
app.post('/vigencia/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;

  var vigencia = new Vigencia({
    contenedor: body.contenedor,
    fManufactura: body.fManufactura,
    fVencimiento: body.fVencimiento,
    observaciones: body.observaciones,
    activo: body.activo,
    usuarioAlta: req.usuario._id
  });

  vigencia.save((err, vigenciaGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear vigencia',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      vigencia: vigenciaGuardado
    });
  });
});

// ==========================================
// Actualizar Vigencia
// ==========================================
app.put('/vigencia/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Vigencia.findById(id, (err, vigencia) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar vigencia',
        errors: err
      });
    }
    if (!vigencia) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La vigencia con el id ' + id + ' no existe',
        errors: { message: 'No existe vigencia con ese ID' }
      });
    }

    vigencia.contenedor = body.contenedor;
    vigencia.fManufactura = body.fManufactura;
    vigencia.fVencimiento = body.fVencimiento;
    vigencia.observaciones = body.observaciones;
    vigencia.usuarioMod = req.usuario._id;
    vigencia.activo = body.activo;
    vigencia.fMod = new Date();
    vigencia.save((err, vigenciaGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar vigencia',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        vigencia: vigenciaGuardado
      });
    });
  });
});

// ============================================
//   Borrar vigencia por el id
// ============================================
app.delete('/vigencia/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Vigencia.findByIdAndRemove(id, (err, vigenciaBorrada) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar vigencia',
        errors: err
      });
    }
    if (!vigenciaBorrada) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe vigencia con ese id',
        errors: { message: 'No existe vigencia con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      vigencia: vigenciaBorrada
    });
  });
});


// =======================================
// Actualizar Vigencia  HABILITAR DESHABILITAR
// =======================================

app.put('/vigenciaDes/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body.action;

  Vigencia.findById(id, (err, vigencia) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar vigencia',
        errors: err
      });
    }
    if (!vigencia) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La vigencia con el id ' + id + ' no existe',
        errors: { message: 'La vigencia con el id ' + id + ' no existe' }
      });
    }
    if (vigencia.activo === body) {
      var hab = ''
      if (body.activo === 'true') {
        hab = 'Activo'
      } else {
        hab = 'Inactivo'
      }
      return res.status(400).json({
        ok: false,
        mensaje: 'Error el estatus de la vigencia ya se encuentra ' + hab,
        errors: { message: 'Error el estatus de la vigencia ya se encuentra ' + hab }
      });
    }
    vigencia.activo = body;
    vigencia.save((err, vigenciaGuardados) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el etatus de la vigencia',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        vigencia: vigenciaGuardados
      });
    });
  });
});
module.exports = app;