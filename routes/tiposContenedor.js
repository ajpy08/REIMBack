var express = require('express');
var app = express();
var TipoContenedor = require('../models/tipoContenedor');
var mdAutenticacion = require('../middlewares/autenticacion');

// ==========================================
//  Obtener todos los tipos Contenedores
// ==========================================
app.get('/', mdAutenticacion.verificaToken,(req, res, next) => {
  TipoContenedor.find({})
    .exec(
      (err, tipos) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar los tipos de contenedores',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          tiposContenedor: tipos,
          total: tipos.length
        });
      });
});

// ==========================================
//  Obtener tipo por ID
// ==========================================
app.get('/tipoContenedor/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  TipoContenedor.findById(id)
    .exec((err, tipo) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el tipo de contenedor',
          errors: err
        });
      }
      if (!tipo) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El tipo contenedor con el id ' + id + 'no existe',
          errors: { message: 'No existe un tipo contenedor con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        tipoContenedor: tipo
      });
    });
});

// ==========================================
//  Obtener tipo Contenedor por Tipo
// ==========================================
app.get('/tipoCont/:tipo', mdAutenticacion.verificaToken, (req, res) => {
  var t = req.params.tipo;
  var tipo = unescape(t);

  TipoContenedor.find({ tipo: tipo }).exec(
    (err, tipoContenedor) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el tipo de contenedor',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        tipo: tipoContenedor
      });
    });
  // TipoContenedor.find({tipo: tipo})
  //   .exec((err, tipo) => {
  //     if (err) {
  //       return res.status(500).json({
  //         ok: false,
  //         mensaje: 'Error al buscar el tipo de contenedor',
  //         errors: err
  //       });
  //     }
  //     if (!tipo) {
  //       return res.status(400).json({
  //         ok: false,
  //         mensaje: 'El tipo contenedor con el tipo ' + tipo + 'no existe',
  //         errors: { message: 'No existe un tipo contenedor con ese tipo' }
  //       });
  //     }
  //     res.status(200).json({
  //       ok: true,
  //       tipo: tipo
  //     });
  //   });
});

// ==========================================
// Crear nuevo Tipo Contenedor
// ==========================================
app.post('/tipo_contenedor/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var tipoContenedor = new TipoContenedor({
    tipo: body.tipo,
    descripcion: body.descripcion,
    pies: body.pies,
    codigoISO: body.codigoISO
  });
  tipoContenedor.save((err, tipoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear el Tipo Contenedor',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      tipoContenedor: tipoGuardado
    });
  });
});

// ==========================================
// Actualizar Tipo Contenedor
// ==========================================
app.put('/tipo_contenedor/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  TipoContenedor.findById(id, (err, tipoContenedor) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar Tipo Contenedor',
        errors: err
      });
    }
    if (!tipoContenedor) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El Tipo Contenedor con el id ' + id + ' no existe',
        errors: { message: 'No existe Tipo Contenedor con ese ID' }
      });
    }

    tipoContenedor.tipo = body.tipo;
    tipoContenedor.descripcion = body.descripcion;
    tipoContenedor.pies = body.pies;
    tipoContenedor.codigoISO = body.codigoISO;

    tipoContenedor.save((err, tipoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar Tipo Contenedor',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        tipoContenedor: tipoGuardado
      });
    });
  });
});

// ============================================
//   Borrar Tipo Contenedor por el id
// ============================================
app.delete('/tipo_contenedor/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  TipoContenedor.findByIdAndRemove(id, (err, tipoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar Tipo Contenedor',
        errors: err
      });
    }
    if (!tipoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe Tipo Contenedor con ese id',
        errors: { message: 'No existe Tipo Contenedor con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      TipoContenedor: tipoBorrado
    });
  });
});

module.exports = app;