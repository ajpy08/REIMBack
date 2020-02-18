var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();
var mongoose = require('mongoose');
var Solicitud = require('../models/solicitud');
var Maniobra = require('../models/maniobra');
const sentMail = require('./sendAlert');

// ==========================================
// Aprobar Solicitud con maniobra
// ==========================================
app.put('/apruebadescarga/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Solicitud.findById(id, (err, solicitud) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar Solicitud',
        errors: err
      });
    }
    if (!solicitud) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La solicitud con el id ' + id + ' no existe',
        errors: { message: 'No existe solicitud con ese ID' }
      });
    }
    //solicitud.contenedores = body.contenedores;
    solicitud.estatus = "APROBADA";
    solicitud.fAprobacion = Date.now();
    solicitud.usuarioAprobo = req.usuario._id;
    solicitud.save((err, solicitudGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la solicitud',
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        solicitud: solicitudGuardado
      });
    });
  });
});


// ==========================================
// Aprobar Solicitud descarga 
// ==========================================
app.put('/solicitud/:id/contenedor/:contenedor', mdAutenticacion.verificaToken, (req, res) => {
  var idSolicitud = req.params.id;
  var idCont = req.params.contenedor;
  var maniobra = req.query.maniobra;
  Solicitud.updateOne({ "_id": new mongoose.Types.ObjectId(idSolicitud), "contenedores._id": new mongoose.Types.ObjectId(idCont) }, {
    $set: { "contenedores.$.maniobra": maniobra }
  }, (err, cont) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar la solicitud',
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      contenedor: cont
    });
  });

});

// ==========================================
// eLIMINAR CONTENEDOR DE LA SOLICITUD
// ==========================================

app.put('/soli/Contenedor/:id&:maniobra',mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id
  var maniobra = req.params.maniobra;

  Solicitud.findOne({ '_id': id }, (err, solicitud) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar solicitud',
        errors: err
      });
    }

    if (!solicitud) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La solicitud con el id' + id + ' no existe',
        errors: { message: 'No existe solicitud con ese ID' }
      });

    }

    var contenedores = solicitud.contenedores.slice();

    contenedores.forEach(c => {
      if (c.maniobra == maniobra) {
        const i = contenedores.indexOf(c);
        contenedores.splice(i, 1);
      }
    });

    if (solicitud.contenedores !== contenedores) {
      solicitud.contenedores = contenedores;
      solicitud.save((err, solicitudGuardado) => {
        if (err) {
          return res, status(400).json({
            ok: false,
            mensaje: 'Error al actualizar contenedor',
            errors: err
          })
        }
        res.status(200).json({
          ok: true,
          solicitud: solicitudGuardado
        });
      });      
    } else {
      if (err) {
        return res, status(400).json({
          ok: false,
          mensaje: 'No hubo cambios',
          errors: err
        });
      }
    }
  });
});

// export
module.exports = app;