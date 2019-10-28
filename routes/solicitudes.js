var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();
var variasBucket = require('../public/variasBucket');
var mongoose = require('mongoose');
var Solicitud = require('../models/solicitud');
var Maniobra = require('../models/maniobra');

// =======================================
// Obtener solicitudes TODAS
// =======================================
app.get('/:tipo?:estatus?:finialta?:ffinalta?:agencias?', (req, res) => {

  var tipo = req.query.tipo || '';
  var estatus = req.query.estatus || '';
  var finialta = req.query.finialta || '';
  var ffinalta = req.query.ffinalta || '';
  var agencias = req.query.agencias || '';

  var filtro = '{';
  if (tipo != 'undefined' && tipo != '')
    filtro += '\"tipo\":' + '\"' + tipo + '\",';
  if (estatus != 'undefined' && estatus != '')
    filtro += '\"estatus\":' + '\"' + estatus + '\",';

  agencias = agencias.replace(/,/g, '\",\"');
  if (agencias != 'undefined' && agencias != '')
    filtro += '\"agencia\":{\"$in\":[\"' + agencias + '\"]},';
  // if (finialta != '' && ffinalta) {
  //   fIni = moment(finialta, 'DD-MM-YYYY', true).utc().startOf('day').format();
  //   fFin = moment(ffinalta, 'DD-MM-YYYY', true).utc().endOf('day').format();
  //   filtro += '\"fArribo\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
  // }
  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);
  // console.log(json);
  Solicitud.find(json)
    .populate('agencia', 'razonSocial nombreComercial')
    .populate('naviera', 'razonSocial nombreComercial')
    .populate('cliente', 'razonSocial nombreComercial')
    .populate('buque', 'nombre')
    .populate('viaje', 'viaje')
    .populate('usuarioAlta', 'nombre email')
    .populate('contenedores.maniobra', 'contenedor tipo estatus grado')
    .exec(
      (err, solicitudes) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando solicitudes',
            errors: err
          });
        }

        res.status(200).json({
          ok: true,
          solicitudes: solicitudes,
          total: solicitudes.length
        });

      });
});

// ==========================================
//  Obtener solicitud por ID
// ==========================================
app.get('/solicitud/:id', (req, res) => {
  var id = req.params.id;
  Solicitud.findById(id)
    .populate('contenedores.maniobra', 'contenedor tipo estatus grado')
    .populate('contenedores.transportista', 'razonSocial nombreComercial')
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
//  Obtener solicitud por ID, CON INCLUDES
// ==========================================

app.get('/solicitud/:id/includes', (req, res) => {
  var id = req.params.id;
  Solicitud.findById(id)
    .populate('agencia', 'razonSocial nombreComercial')
    .populate('naviera', 'razonSocial nombreComercial')
    .populate('transportista', 'razonSocial nombreComercial')
    .populate('cliente', 'razonSocial nombreComercial')
    .populate('buque', 'nombre _id')
    .populate('viaje', 'viaje')
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioAprobo', 'nombre email')
    .populate('contenedores.maniobra', 'contenedor tipo estatus grado folio solicitud')
    .populate('contenedores.transportista', 'razonSocial nombreComercial')
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
app.post('/solicitud/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var solicitud;
  if (body.tipo === 'D') {
    solicitud = new Solicitud({
      agencia: body.agencia,
      naviera: body.naviera,
      cliente: body.cliente,
      buque: body.buque,
      nombreBuque: body.nombreBuque,
      blBooking: body.blBooking,
      viaje: body.viaje,
      noViaje: body.noViaje,
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
    variasBucket.MoverArchivoBucket('temp/', solicitud.rutaBL, 'solicitudes/');
  }
  if (!solicitud.credito && solicitud.rutaComprobante != '..') {
    variasBucket.MoverArchivoBucket('temp/', solicitud.rutaComprobante, 'solicitudes/');
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
app.put('/solicitud/:id', mdAutenticacion.verificaToken, (req, res) => {
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
      solicitud.buque = body.buque !== '' ? body.buque : undefined;
      solicitud.nombreBuque = body.nombreBuque !== '' ? body.nombreBuque : undefined;
      solicitud.viaje = body.viaje !== '' ? body.viaje : undefined;
      solicitud.noViaje = body.noViaje !== '' ? body.noViaje : undefined;
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
        if (variasBucket.MoverArchivoBucket('temp/', body.rutaBL, 'solicitudes/')) {
          if (solicitud.rutaBL != null && solicitud.rutaBL != undefined && solicitud.rutaBL != '') { //BORRAR EL ACTUAL
            variasBucket.BorrarArchivoBucket('solicitudes/', solicitud.rutaBL);
          }
          solicitud.rutaBL = body.rutaBL;
        }
      }
    }

    if (!solicitud.credito && body.rutaComprobante != '..' && solicitud.rutaComprobante != body.rutaComprobante) {
      if (variasBucket.MoverArchivoBucket('temp/', body.rutaComprobante, 'solicitudes/')) {
        if (solicitud.rutaComprobante != null && solicitud.rutaComprobante != undefined && solicitud.rutaComprobante != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('solicitudes/', solicitud.rutaComprobante);
        }
        solicitud.rutaComprobante = body.rutaComprobante;
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
// Actualizar buque viaje Solicitud
// ==========================================
app.put('/solicitud/:id/guarda_buque_viaje', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  console.log('guarda viaje buque');
  Solicitud.findById(id, (err, solicitud) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar la solicitud',
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

    if (solicitud.tipo === 'C') {
      return res.status(400).json({
        ok: false,
        mensaje: 'La solicitud es una carga por lo tanto no cplica Buque viaje.',
        errors: { message: 'La solicitud es una carga por lo tanto no cplica Buque viaje.' }
      });
    }
    solicitud.buque = body.buque !== '' ? body.buque : undefined;
    solicitud.viaje = body.viaje !== '' ? body.viaje : undefined;
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
app.put('/solicitud/:id/apruebacarga', mdAutenticacion.verificaToken, (req, res) => {

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


    // solicitud.contenedores.forEach((element, index) => {
    //   if (element.maniobra == null || element.maniobra == undefined || element.maniobra == '') {
    //     var maniobra;
    //     maniobra = new Maniobra({
    //       solicitud: solicitud._id,
    //       cargaDescarga: solicitud.tipo,
    //       cliente: solicitud.cliente,
    //       agencia: solicitud.agencia,
    //       transportista: element.transportista,
    //       correo: solicitud.correo,
    //       correoFac: solicitud.correoFac,
    //       tipo: element.tipo,
    //       peso: element.peso,
    //       grado: element.grado,
    //       estatus: 'TRANSITO',
    //       patio: element.patio,
    //       usuarioAlta: req.usuario._id
    //     });
    //     solicitud.contenedores[index].maniobra = maniobra._id;
    //     maniobra.save((err, maniobraGuardado) => {
    //       if (err) {
    //         console.log(err);
    //       } else {
    //         console.log(maniobraGuardado._id);

    //       }
    //     });
    //   }
    // });

    // console.log(solicitud.contenedores);
    // //solicitud.contenedores = body.contenedores;
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




// =======================================
// Borrar Solicitud
// =======================================

app.delete('/solicitud/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Solicitud.findById(id, (err, solicitudBorrada) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al intentar borrar la solicitud',
        errors: err
      });
    }
    if (!solicitudBorrada) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe solicitud con ese id',
        errors: { message: 'No existe solicitud con ese id' }
      });
    }
    if (solicitudBorrada.estatus !== "NA") {
      return res.status(400).json({
        ok: false,
        mensaje: 'La solicitud no puede ser eliminada porque tiene el estado de ' + solicitudBorrada.estatus,
        errors: { message: 'La solicitud no puede ser eliminada porque tiene el estado de ' + solicitudBorrada.estatus }
      });
    }

    variasBucket.BorrarArchivoBucket('solicitudes/', solicitudBorrada.rutaComprobante);
    variasBucket.BorrarArchivoBucket('solicitudes/', solicitudBorrada.rutaBL);

    solicitudBorrada.remove();
    res.status(200).json({
      ok: true,
      viaje: solicitudBorrada
    });
  });
});




// export
module.exports = app;