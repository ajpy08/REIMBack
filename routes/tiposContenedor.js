var express = require('express');
var app = express();
var TipoContenedor = require('../models/tipoContenedor');


app.get('/', (req, res, next) => {
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
app.get('/tipoContenedor/:id', (req, res) => {
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
//  Obtener tipo por ID
// ==========================================
app.get('/tipoCont/:tipo', (req, res) => {
  var tipo = req.params.tipo;

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

module.exports = app;