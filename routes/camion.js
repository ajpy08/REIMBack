var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Camion = require('../models/camion');
var fs = require('fs');
var app = express();

// ==========================================
// Obtener todos los camiones
// Por el query podrian pasar como parametro el filtro por transportista        
// ==========================================

app.get('/', (req, res, next) => {
  var transportista = req.query.transportista || '';
  var filtro = '{';
  if (transportista != 'undefined' && transportista != '')
    filtro += '\"transportista\":' + '\"' + transportista + '\",';
  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  Camion.find(json)
    .populate('usuarioAlta', 'nombre email')
    .populate('transportista', 'rfc razonSocial')
    .exec(
      (err, camiones) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar camiones',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          camiones: camiones,
          total: camiones.length
        });
      });
});

// ==========================================
//  Obtener Camiones por ID
// ==========================================
app.get('/camion/:id', (req, res) => {
  var id = req.params.id;
  Camion.findById(id)
    .exec((err, camion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el camion',
          errors: err
        });
      }
      if (!camion) {
        return res.status(400).json({
          ok: false,
          mensaje: 'el camion con el id ' + id + 'no existe',
          errors: { message: 'No existe un camion con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        camion: camion
      });
    });
});

// ==========================================
// Crear nuevo Camión
// ==========================================
app.post('/camion/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  // console.log(body)
  var camion = new Camion({
    transportista: body.transportista,
    operador: body.operador,
    placa: body.placa,
    noEconomico: body.noEconomico,
    vigenciaSeguro: body.vigenciaSeguro,
    pdfSeguro: body.pdfSeguro,
    usuarioAlta: req.usuario._id
  });

  if (camion.pdfSeguro != '' && fs.existsSync('./uploads/temp/' + camion.pdfSeguro)) {
    fs.rename('./uploads/temp/' + camion.pdfSeguro, './uploads/camiones/' + camion.pdfSeguro, (err) => {
      if (err) { console.log(err); }
    });
  }

  camion.save((err, camionGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear camion',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      mensaje: 'Camion creado con éxito.',
      camion: camionGuardado
    });
  });
});

// ==========================================
// Actualizar Camión
// ==========================================
app.put('/camion/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  //console.log(body)
  Camion.findById(id, (err, camion) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar camion',
        errors: err
      });
    }
    if (!camion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Las camion con el id ' + id + ' no existe',
        errors: { message: 'No existe camion con ese ID' }
      });
    }
    camion.transportista = body.transportista,
      camion.operador = body.operador,
      camion.placa = body.placa;
    camion.noEconomico = body.noEconomico;
    camion.vigenciaSeguro = body.vigenciaSeguro;
    camion.usuarioMod = req.usuario._id;
    camion.fMod = new Date();
    if (camion.pdfSeguro != body.pdfSeguro) {
      if (fs.existsSync('./uploads/temp/' + body.pdfSeguro)) {
        if (camion.pdfSeguro != undefined || camion.pdfSeguro != '' && camion.pdfSeguro != null && fs.existsSync('./uploads/camiones/' + camion.pdfSeguro)) {
          fs.unlink('./uploads/camiones/' + camion.pdfSeguro, (err) => {
            if (err) console.log(err);
            else
              console.log('Imagen anterior fue borrada con éxito');
          });
        }
        fs.rename('./uploads/temp/' + body.pdfSeguro, './uploads/camiones/' + body.pdfSeguro, (err) => {
          if (err) { console.log(err); }
        });
        camion.pdfSeguro = body.pdfSeguro;
      }
    }
    camion.save((err, camionGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar camion',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        camion: camionGuardado
      });
    });
  });
});

// ============================================
//   Borrar camion por el id
// ============================================
app.delete('/camion/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Camion.findByIdAndRemove(id, (err, camionBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar camion',
        errors: err
      });
    }
    if (!camionBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe camion con ese id',
        errors: { message: 'No existe camion con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      mensaje: 'Camion borrado con exito',
      camion: camionBorrado
    });
  });
});

module.exports = app;