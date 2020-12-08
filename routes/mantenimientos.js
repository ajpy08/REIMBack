// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Maniobra = require('../models/maniobra');

app.use();


// =======================================
// Obtener Mantenimiento
// =======================================
app.get('/mantenimiento/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Mantenimiento.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, mantenimiento) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el mantenimiento',
          errors: err
        });
      }
      if (!mantenimiento) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El mantenimiento con el id ' + id + ' no existe',
          errors: { message: 'No existe un mantenimiento con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        mantenimiento: mantenimiento
      });
    });
});


// =======================================
// Obtener eventosñ
// =======================================
app.get('/xmaniobra/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Mantenimiento.find({ maniobra: id })
    .populate('usuario', 'nombre email')
    .exec((err, mantenimientos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error los mantenimientos',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mantenimientos: mantenimientos,
        total: mantenimiento.length
      });

    });
});



module.exports = app;