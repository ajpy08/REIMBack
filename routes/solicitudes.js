var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');
var app = express();
var varias = require('../public/varias');
var mongoose = require('mongoose');


var Solicitud = require('../models/solicitud');
var Maniobra = require('../models/maniobra');

// =======================================
// Obtener solicitudes TODAS
// =======================================
app.get('/:tipo?:estatus?:finialta?:ffinalta?', (req, res) => {

  var tipo = req.query.tipo || '';
  var estatus = req.query.estatus || '';
  var finialta = req.query.finialta || '';
  var ffinalta = req.query.ffinalta || '';
  var agencias = req.query.agencias || '';
  agencias = agencias.replace(',', '\",\"');
  var filtro = '{';
  if (tipo != 'undefined' && tipo != '')
    filtro += '\"tipo\":' + '\"' + tipo + '\",';
  if (estatus != 'undefined' && estatus != '')
    filtro += '\"estatus\":' + '\"' + estatus + '\",';
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
    .populate('agencia', 'razonSocial')
    .populate('naviera', 'razonSocial')
    .populate('cliente', 'razonSocial')
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

// // =======================================
// // Obtener solicitudes id de agencia
// // =======================================
// app.get('/agencia/:agencias', (req, res) => {
//   var desde = req.query.desde || 0;
//   desde = Number(desde);
//   var agencias = req.params.agencias;
//   var a = ['5bfecd483965fc0b7058ceae', '5c1ad1bf5657c12c4c4bfc6b'];

//   SolicitudD.find({ agencia: { "$in": a } })
//     .skip(desde)
//     .populate('agencia', 'razonSocial')
//     .populate('naviera', 'razonSocial')
//     .populate('transportista', 'razonSocial')
//     .populate('cliente', 'razonSocial')
//     .populate('buque', 'buque')
//     .populate('usuario', 'nombre email')
//     .exec(
//       (err, solicitudesD) => {
//         if (err) {
//           return res.status(500).json({
//             ok: false,
//             mensaje: 'Error cargando solicitudes',
//             errors: err
//           });
//         }
//         SolicitudD.countDocuments({ agencia: { "$in": a } }, (err, conteo) => {
//           res.status(200).json({
//             ok: true,
//             solicitudesD,
//             total: conteo
//           });

//         });

//       });
// });


// // =======================================
// // Obtener solicitudes NO APROBADAS
// // =======================================
// app.get('/NA/', (req, res) => {
//   var desde = req.query.desde || 0;
//   desde = Number(desde);
//   var estatus = 'NA';

//   Solicitud.find({ 'estatus': estatus })
//     .populate('agencia', 'razonSocial')
//     .populate('naviera', 'razonSocial')
//     .populate('cliente', 'razonSocial')
//     .populate('buque', 'nombre')
//     .populate('viaje', 'viaje')
//     .populate('usuarioAlta', 'nombre email')
//     .populate('contenedores.maniobra', 'contenedor tipo estatus grado')
//     .exec(
//       (err, solicitudesD) => {
//         if (err) {
//           return res.status(500).json({
//             ok: false,
//             mensaje: 'Error cargando solicitudes',
//             errors: err
//           });
//         }
//         SolicitudD.countDocuments({ 'estatus': estatus }, (err, conteo) => {
//           res.status(200).json({
//             ok: true,
//             solicitudesD,
//             total: conteo
//           });

//         });

//       });
// });

// // =======================================
// // Obtener solicitudes de Descarga
// // =======================================
// app.get('/descargas/', (req, res) => {
//   Solicitud.find({ 'tipo': 'D' })
//     .populate('agencia', 'razonSocial')
//     .populate('naviera', 'razonSocial')
//     .populate('cliente', 'razonSocial')
//     .populate('buque', 'nombre')
//     .populate('viaje', 'viaje')
//     .populate('contenedores.maniobra', 'contenedor tipo estatus grado')
//     .populate('usuarioAlta', 'nombre email')

//   .exec(
//     (err, solicitudes) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'Error cargando solicitudes',
//           errors: err
//         });
//       }
//       res.status(200).json({
//         ok: true,
//         solicitudes: solicitudes,
//         total: solicitudes.length
//       });
//     });
// });

// // =======================================
// // Obtener solicitudes de Carga
// // =======================================
// app.get('/cargas/', (req, res) => {
//   Solicitud.find({ 'tipo': 'C' })
//     .populate('agencia', 'razonSocial')
//     .populate('naviera', 'razonSocial')
//     .populate('cliente', 'razonSocial')
//     .populate('buque', 'nombre')
//     .populate('contenedores.maniobra', 'contenedor tipo estatus grado')
//     .populate('usuarioAlta', 'nombre email')
//     .exec(
//       (err, solicitudes) => {
//         if (err) {
//           return res.status(500).json({
//             ok: false,
//             mensaje: 'Error cargando solicitudes',
//             errors: err
//           });
//         }
//         res.status(200).json({
//           ok: true,
//           solicitudes: solicitudes,
//           total: solicitudes.length
//         });
//       });
// });




// export
module.exports = app;