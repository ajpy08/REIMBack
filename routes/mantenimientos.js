// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Mantenimiento = require('../models/mantenimiento');
var variasBucket = require('../public/variasBucket');

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
// Obtener mantenimientos
// =======================================
//app.get('/xmaniobra/:id', mdAutenticacion.verificaToken, (req, res) => {
app.get('/xmaniobra/:id', (req, res) => {
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
        total: mantenimientos.length
      });

    });
});

// =======================================
// Obtener mantenimientos x TIPO
// =======================================
app.get('/xtipo/:tipo', mdAutenticacion.verificaToken, (req, res) => {
  //app.get('/xtipo/:tipo', (req, res) => {
  var tipo = req.params.tipo;

  Mantenimiento.find({ tipoMantenimiento: tipo })
    .populate('usuario', 'nombre email')
    .populate('maniobra', 'contenedor tipo peso')
    .exec((err, mantenimientos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error los mantenimientos',
          errors: err
        });
      }
      console.log(mantenimientos);
      res.status(200).json({
        ok: true,
        mantenimientos: mantenimientos,
        total: mantenimientos.length

      });

    });
});

// ==========================================
// Agregar mantenimiento a la maniobra
// ==========================================

app.post('/mantenimiento', mdAutenticacion.verificaToken, (req, res) => {

  var body = req.body.mantenimiento;
  // console.log(body);
  var mantenimiento = new Mantenimiento({
    maniobra: body.maniobra,
    tipoMantenimiento: body.tipoMantenimiento,
    tipoLavado: body.tipoLavado,
    cambioGrado: body.cambioGrado,
    observacionesGenerales: body.observacionesGenerales,
    izquierdo: body.izquierdo,
    derecho: body.derecho,
    frente: body.frente,
    posterior: body.posterior,
    piso: body.piso,
    techo: body.techo,
    interior: body.interior,
    puerta: body.puerta,
    fechas: body.fechas,
    materiales: body.materiales,
    finalizado: body.finalizado,
    usuarioAlta: req.usuario._id
  });

  mantenimiento.save((err, mantenimientoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al agregar el mantenimiento',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      mantenimiento: mantenimientoGuardado
    });
  });


});


// ==========================================
// Editar mantenimientos de la maniobra
// ==========================================
app.put('/mantenimiento/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body.mantenimiento;

  Mantenimiento.findById(id, (err, mantenimiento) => {
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
        errors: { message: 'No existe mantenimiento con ese ID' }
      });
    }


    mantenimiento.tipoMantenimiento = body.tipoMantenimiento,
      mantenimiento.tipoLavado = body.tipoLavado,
      mantenimiento.cambioGrado = body.cambioGrado,
      mantenimiento.observacionesGenerales = body.observacionesGenerales,
      mantenimiento.izquierdo = body.izquierdo,
      mantenimiento.derecho = body.derecho,
      mantenimiento.frente = body.frente,
      mantenimiento.posterior = body.posterior,
      mantenimiento.piso = body.piso,
      mantenimiento.techo = body.techo,
      mantenimiento.interior = body.interior,
      mantenimiento.puerta = body.puerta,
      mantenimiento.fechas = body.fechas,
      mantenimiento.materiales = body.materiales,
      mantenimiento.finalizado = body.finalizado,
      mantenimiento.usuarioMod = req.usuario._id,
      mantenimiento.fMod = new Date();

    mantenimiento.save((err, mantenimientoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el mantenimiento',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mantenimiento: mantenimientoGuardado
      });
    });
  });

});

// ==========================================
// Remover eventos de la maniobra
// ==========================================

app.delete('/mantenimiento/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Mantenimiento.findByIdAndRemove(id, (err, mantenimientoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el mantenimiento',
        errors: err
      });
    }
    if (!mantenimientoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe mantenimiento con ese id',
        errors: { message: 'No existe mantenimiento con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      mantenimiento: mantenimientoBorrado
    });
  });
});

// ==========================================
// Migrar fotos de maniobras a mantenimientos (BUCKET)
// ==========================================
app.get('/migracion/fotos',  mdAutenticacion.verificaToken, (req, res, next) => {

  // Mantenimiento.find({maniobra: '5fcbc717461c4f05583690cd'})
  Mantenimiento.find()
    .sort({ fAlta: -1 })
    .exec((err, mantenimientos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar mantenimientos',
          errors: err
        });
      }

      mantenimientos.forEach(async (man) => {
        var LR = man.tipoMantenimiento == 'LAVADO' ? 'fotos_lavado' : 'fotos_reparacion'
        var ruta = 'maniobras/' + man.maniobra + '/' + LR + '/';
        var rutaDestino = 'mantenimientos/' + man._id + '/fotos_despues/';
        variasBucket.ListaArchivosBucket(ruta).then(data => {
          data.forEach(d => {
            const rutaBase = d.Key.substring(0, d.Key.lastIndexOf('/') + 1);
            const nombreArchivo = d.Key.substring(d.Key.lastIndexOf('/') + 1, d.Key.length);
            variasBucket.CopiarArchivoBucket(rutaBase, nombreArchivo, rutaDestino);
          });
        });
      });
      res.status(200).json({
        ok: true,
        mantenimientos,
        total: mantenimientos.length
      });
    });
});


module.exports = app;