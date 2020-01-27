var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();
var variasBucket = require('../public/variasBucket');
var mongoose = require('mongoose');
var Solicitud = require('../models/solicitud');
var Maniobra = require('../models/maniobra');
var moment = require('moment');



// =======================================
// Crear liberaciones
// =======================================
app.post('/liberacion_bk/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
   var solicitud;
      solicitud = new Solicitud({
        // agencia: body.agencia,
        naviera: body.naviera,
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
    
    // } else {
    //   liberacion = new liberacion({
    //     agencia: body.agencia,
    //     naviera: body.naviera,
    //     transportista: body.transportista,
    //     cliente: body.cliente,
    //     observaciones: body.observaciones,
    //     correo: body.correo,
    //     contenedores: body.contenedores,
    //     tipo: body.tipo,
    //     blBooking: body.blBooking,
    //     facturarA: body.facturarA,
    //     rfc: body.rfc,
    //     razonSocial: body.razonSocial,
    //     calle: body.razonSocial,
    //     noExterior: body.noExterior,
    //     noInterior: body.noInterior,
    //     colonia: body.colonia,
    //     municipio: body.municipio,
    //     ciudad: body.ciudad,
    //     estado: body.estado,
    //     cp: body.cp,
    //     correoFac: body.correoFac,
    //     credito: body.credito,
    //     rutaComprobante: body.rutaComprobante,
    //     usuarioAlta: req.usuario._id
    //   });
    // }
    // if (liberacion.tipo == 'D') {
    //   variasBucket.MoverArchivoBucket('temp/', solicitud.rutaBL, 'solicitudes/');
    // }
    if (!solicitud.credito && solicitud.rutaComprobante != '..') {
      variasBucket.MoverArchivoBucket('temp/', solicitud.rutaComprobante, 'liberaciones_bk/');
    } else {
      solicitud.rutaComprobante = undefined;
    }
    solicitud.save((err, solicitudGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al crear liberacionBL',
          errors: err
        });
      }
      res.status(201).json({
        ok: true,
        solicitud: solicitudGuardado
      });
    });
  });

  module.exports = app;