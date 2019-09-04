var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();
var varias = require('../public/varias');
var mongoose = require('mongoose');
var Solicitud = require('../models/solicitud');
var Maniobra = require('../models/maniobra');



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
        mensaje: 'Error al buscar viaje',
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
      // solicitud.contenedores.forEach((element) => {
      //   Maniobra.findById(element.maniobra, (err, maniobra) => {
      //     maniobra.estatus = "TRANSITO";
      //     maniobra.solicitud = id;
      //     maniobra.agencia = solicitud.agencia;
      //     maniobra.transportista = solicitud.transportista;
      //     maniobra.cliente = solicitud.cliente;
      //     maniobra.save((err, maniobraGuardado) => {});
      //   });
      // });
    });
  });
});


// ==========================================
// Aprobar Solicitud descarga 
// ==========================================
app.put('/apruebadescarga/:idsol/contenedor/:idcont', mdAutenticacion.verificaToken, (req, res) => {
  var idSolicitud = req.params.idsol;
  var idCont = req.params.idcont;
  var body = req.body;
  Solicitud.updateOne({ "_id": new mongoose.Types.ObjectId(idSolicitud), "contenedores._id": new mongoose.Types.ObjectId(idCont) }, {
    $set: { "contenedores.$.usuarioAprobo": new mongoose.Types.ObjectId(req.usuario._id), "contenedores.$.maniobra": "3333", "contenedores.$.fAprobacion": Date.now() }
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
// Aprobar Solicitud con maniobra
// ==========================================
app.put('/apruebacarga/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Solicitud.findById(id, (err, solicitud) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar viaje',
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

      body.contenedores.forEach(function(element) {
        var maniobra;
        maniobra = new Maniobra({
          solicitud: id,
          cargaDescarga: 'C',
          cliente: solicitud.cliente,
          agencia: solicitud.agencia,
          transportista: solicitud.transportista,
          correo: solicitud.correo,
          correoFac: solicitud.correoFac,
          tipo: element.tipo,
          estado: element.estado,
          grado: element.grado,
          estatus: 'TRANSITO',
          usuarioAlta: req.usuario._id
        });

        maniobra.save((err, maniobraGuardado) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              ok: false,
              mensaje: "Error al cargar la maniobra",
              errors: err
            });
          }
        });
      });
    });
  });
});



// export
module.exports = app;