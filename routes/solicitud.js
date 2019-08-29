var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();
var varias = require('../public/varias');
var mongoose = require('mongoose');
var Solicitud = require('../models/solicitud');
var Maniobra = require('../models/maniobra');

// ==========================================
//  Obtener solicitudes por ID
// ==========================================
app.get('/:id', (req, res) => {
  var id = req.params.id;
  Solicitud.findById(id)
    .populate('contenedores.maniobra', 'contenedor tipo estatus grado')
    .populate('contenedores.transportista', 'razonSocial')
    .exec((err, solicitud) => {
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
          mensaje: 'La solicitud con el id ' + id + 'no existe',
          errors: { message: 'No existe una solicitud con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        solicitud: solicitud
      });
    });
});

// ==========================================
//  Obtener solicitudes por ID, CON INCLUDES
// ==========================================

app.get('/:id/includes', (req, res) => {
  var id = req.params.id;
  Solicitud.findById(id)
    .populate('agencia', 'razonSocial')
    .populate('naviera', 'razonSocial')
    .populate('transportista', 'razonSocial')
    .populate('cliente', 'razonSocial')
    .populate('buque', 'nombre _id')
    .populate('viaje', 'viaje')
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioAprobo', 'nombre email')
    .populate('contenedores.maniobra', 'contenedor tipo estatus grado folio solicitud')
    .populate('contenedores.transportista', 'razonSocial')
    .exec((err, solicitud) => {
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
          mensaje: 'La solicitud con el id ' + id + 'no existe',
          errors: { message: 'No existe una solicitud con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        solicitud: solicitud
      });
    });
});

// =======================================
// Crear Solicitudes
// =======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var solicitud;
  if (body.tipo === 'D') {
    solicitud = new Solicitud({
      agencia: body.agencia,
      naviera: body.naviera,
      cliente: body.cliente,
      buque: body.buque,
      blBooking: body.blBooking,
      viaje: body.viaje,
      observaciones: body.observaciones,
      rutaBL: body.rutaBL,
      correo: body.correo,
      contenedores: body.contenedores,
      tipo: body.tipo,
      facturarA: body.facturarA,
      rfc: body.rfc,
      razonSocial: body.razonSocial,
      calle: body.razonSocial,
      noExterior: body.noExterior,
      noInterior: body.noInterior,
      colonia: body.colonia,
      municipio: body.municipio,
      ciudad: body.ciudad,
      estado: body.estado,
      cp: body.cp,
      correoFac: body.correoFac,
      credito: body.credito,
      rutaComprobante: body.rutaComprobante,
      usuarioAlta: req.usuario._id
    });
  } else {
    solicitud = new Solicitud({
      agencia: body.agencia,
      transportista: body.transportista,
      cliente: body.cliente,
      observaciones: body.observaciones,
      correo: body.correo,
      contenedores: body.contenedores,
      tipo: body.tipo,
      blBooking: body.blBooking,
      facturarA: body.facturarA,
      rfc: body.rfc,
      razonSocial: body.razonSocial,
      calle: body.razonSocial,
      noExterior: body.noExterior,
      noInterior: body.noInterior,
      colonia: body.colonia,
      municipio: body.municipio,
      ciudad: body.ciudad,
      estado: body.estado,
      cp: body.cp,
      correoFac: body.correoFac,
      credito: body.credito,
      rutaComprobante: body.rutaComprobante,
      usuarioAlta: req.usuario._id
    });
  }
  if (solicitud.tipo == 'D') {
    varias.MoverArchivoFromTemp('./uploads/temp/', solicitud.rutaBL, './uploads/solicitudes/', solicitud.rutaBL);
  }
  if (!solicitud.credito && solicitud.rutaComprobante != '..') {
    varias.MoverArchivoFromTemp('./uploads/temp/', solicitud.rutaComprobante, './uploads/solicitudes/', solicitud.rutaComprobante);
  } else {
    solicitud.rutaComprobante = undefined;
  }
  solicitud.save((err, solicitudGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear solicitud',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      solicitud: solicitudGuardado
    });
  });
});

// ==========================================
// Actualizar Solicitud
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
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
    if (solicitud.estatus === 'APROBADA') {
      return res.status(400).json({
        ok: false,
        mensaje: 'La solicitud ha sido aprobada con anterioridad y no puede ser modificada.',
        errors: { message: 'La solicitud ha sido aprobada con anterioridad y no puede ser modificada.' }
      });
    }
    if (solicitud.tipo == 'D') {
      solicitud.naviera = body.naviera;
      solicitud.buque = body.buque;
      solicitud.viaje = body.viaje;
    }
    solicitud.blBooking = body.blBooking;
    solicitud.agencia = body.agencia;
    solicitud.transportista = body.transportista;
    solicitud.cliente = body.cliente;
    solicitud.facturarA = body.facturarA;
    solicitud.observaciones = body.observaciones;
    solicitud.correo = body.correo;
    solicitud.contenedores = body.contenedores;
    solicitud.facturarA = body.facturarA;
    solicitud.rfc = body.rfc;
    solicitud.razonSocial = body.razonSocial;
    solicitud.calle = body.razonSocial;
    solicitud.noExterior = body.noExterior;
    solicitud.noInterior = body.noInterior;
    solicitud.colonia = body.colonia;
    solicitud.municipio = body.municipio;
    solicitud.ciudad = body.ciudad;
    solicitud.estado = body.estado;
    solicitud.cp = body.cp;
    solicitud.credito = body.credito;
    correoFac = body.correoFac;
    solicitud.fMod = Date.now();
    solicitud.usuarioMod = req.usuario._id;

    if (solicitud.tipo == 'D') {
      if (solicitud.rutaBL != body.rutaBL) {
        if (varias.MoverArchivoFromTemp('./uploads/temp/', body.rutaBL, './uploads/solicitudes/', solicitud.rutaBL)) {
          solicitud.rutaBL = body.rutaBL;
        }
      }
    }

    if (!solicitud.credito && body.rutaComprobante != '..' && solicitud.rutaComprobante != body.rutaComprobante) {
      if (varias.MoverArchivoFromTemp('./uploads/temp/', body.rutaComprobante, './uploads/solicitudes/', solicitud.rutaComprobante)) {
        solicitud.rutaBL = body.rutaBL;
      }
    }
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








// =======================================
// Borrar Solicitud
// =======================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  SolicitudD.findByIdAndRemove(id, (err, solicitudBorrado) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: err
      });
    }

    if (!solicitudBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con ese id',
        errors: { message: 'No existe un usuario con ese id' }
      });
    }

    res.status(200).json({
      ok: true,
      solicitud: solicitudBorrado
    });
  });
});

// export
module.exports = app;