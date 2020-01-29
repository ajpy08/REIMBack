var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();
var variasBucket = require('../public/variasBucket');
var mongoose = require('mongoose');
var Liberaciones = require('../models/liberacion');
var Maniobra = require('../models/maniobra');
var moment = require('moment');



// =======================================
// Obtener solicitudes TODAS
// =======================================
app.get('/:agenia?:tipo?:estatus?:finialta?:ffinalta?:naviera?', (req, res) => {
  var tipo = req.query.tipo || '';
  var estatus = req.query.estatus || '';
  var finialta = req.query.finialta || '';
  var ffinalta = req.query.ffinalta || '';
  var naviera = req.query.naviera || '';
  var agencias = req.query.agencias || '';

  var filtro = '{';

  if (agencias != 'undefined' && agencias != '')
  filtro += '\"agencia\":{\"$in\":[\"' + agencias + '\"]},';

  if (tipo != 'undefined' && tipo != '')
    filtro += '\"tipo\":' + '\"' + tipo + '\",';

  if (estatus != 'undefined' && estatus != '')
    filtro += '\"estatus\":' + '\"' + estatus + '\",';

  if (naviera != 'undefined' && naviera != '')

    filtro += '\"naviera\":{\"$in\":[\"' + naviera + '\"]},';

  if (finialta != '' && ffinalta) {
    fIni = moment(finialta, 'DD-MM-YYYY', true).utc().startOf('day').format();
    fFin = moment(ffinalta, 'DD-MM-YYYY', true).utc().endOf('day').format();

    filtro += '\"fAlta\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
  }
  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);
  Liberaciones.find(json)
    .populate('naviera', 'razonSocial nombreComercial')
    .populate('agencia', 'razonSocial nombreComercial')
    .populate('cliente', 'razonSocial nombreComercial')
    .populate('viaje', 'viaje')
    .populate('usuarioAlta', 'nombre email role')
    .populate('contenedores.maniobra', 'contenedor tipo estatus grado')
    .exec(
      (err, liberacion) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando liberacion',
            errors: err
          });
        }

        res.status(200).json({
          ok: true,
          liberacion: liberacion,
          total: liberacion.length
        });

      });
});



// =======================================
// Crear liberaciones
// =======================================
app.post('/liberacion_bk/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var liberacion;
  liberacion = new Liberaciones({
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


  if (!liberacion.credito && liberacion.rutaComprobante != '..') {
    variasBucket.MoverArchivoBucket('temp/', liberacion.rutaComprobante, 'liberaciones_bk/');
  } else {
    liberacion.rutaComprobante = undefined;
  }
  liberacion.save((err, liberacionGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear liberacionBL',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      liberacion: liberacionGuardado
    });
  });
});

module.exports = app;