// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Maniobra = require('../models/maniobra');
var ParamsToJSON = require('../public/varias');


// =======================================
// Obtener Maniobras
// =======================================
app.get('', (req, res, netx) => {
  var cargadescarga = req.query.cargadescarga || '';
  var estatus = req.query.estatus || '';
  var transportista = req.query.transportista || '';
  var contenedor = req.query.contenedor || '';
  var viaje = req.query.viaje || '';
  var peso = req.query.peso || '';
  var lavado = req.query.lavado || '';
  var reparacion = req.query.reparacion || '';

  var filtro = '{';
  if (cargadescarga != 'undefined' && cargadescarga != '')
    filtro += '\"cargaDescarga\":' + '\"' + cargadescarga + '\",';
  if (estatus != 'undefined' && estatus != '')
    filtro += '\"estatus\":' + '\"' + estatus + '\",';
  if (transportista != 'undefined' && transportista != '')
    filtro += '\"transportista\":' + '\"' + transportista + '\",';
  if (contenedor != 'undefined' && contenedor != '')
    filtro += '\"contenedor\":{ \"$regex\":' + '\".*' + contenedor + '\",\"$options\":\"i\"},';
  if (viaje != 'undefined' && viaje != '')
    filtro += '\"viaje\":' + '\"' + viaje + '\",';
  if (peso != 'undefined' && peso != '')
    filtro += '\"peso\":' + '\"' + peso + '\",';

  if(lavado === 'true'){
    filtro += '\"lavado\"' + ': {\"$in\": [\"E\", \"B\"]},';
  }

  if(reparacion === 'true'){
    filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true},';
  }

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  Maniobra.find(json)
    .populate('cliente', 'rfc razonSocial')
    .populate('agencia', 'rfc razonSocial')
    .populate('transportista', 'rfc razonSocial')
    .populate('operador', 'nombre')
    .populate('camion', 'placa noEconomico')
    .populate({
      path: "viaje",
      select: 'viaje fechaArribo',
      populate: {
        path: "buque",
        select: 'nombre'
      }
    })
    .populate('usuarioAlta', 'nombre email')
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobras: maniobras,
        total: maniobras.length
      });
    });
});



// ============================================
// Obtener Maniobras que tuvieron lavado o reparacion (de alguna naviera o de todas las navieras)
// ============================================
app.get('/LR', (req, res, next) => {
  var naviera = req.query.naviera || '';
  var buque = req.query.buque || '';
  var viaje = req.query.viaje || '';
  var fechaLlegadaInicio = req.query.fechaLlegadaInicio || '';
  var fechaLlegadaFin = req.query.fechaLlegadaFin || '';

  var filtro = '{';
  filtro += '\"$or\": [';
  filtro += '{\"lavado\"' + ': {\"$in\": [\"E\", \"B\"]} },';
  filtro += '{\"reparaciones.0\"' + ': {\"$exists\"' + ': true} }';
  filtro += '],';


  if (viaje != 'undefined' && viaje != '')
    filtro += '\"viaje\":' + '\"' + viaje + '\",';

  if (fechaLlegadaInicio != '' && fechaLlegadaInicio) {
    fIni = moment(fechaLlegadaInicio, 'DD-MM-YYYY', true).utc().startOf('day').format();
    fFin = moment(fechaLlegadaFin, 'DD-MM-YYYY', true).utc().endOf('day').format();
    filtro += '\"fLlegada\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
  }

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  var filtro2 = '{';


  if (buque != 'undefined' && buque != '') {
    filtro2 += '\"viaje.buque\":' + '\"' + buque + '\",';
  } else {
    if (naviera != 'undefined' && naviera != '') {
      filtro2 += '\"naviera\":' + '\"' + naviera + '\",';
    }
  }


  if (filtro2 != '{')
    filtro2 = filtro2.slice(0, -1);
  filtro2 = filtro2 + '}';
  var json2 = JSON.parse(filtro2);

  Maniobra.find(
    json
  )
    .populate('cliente', 'rfc razonSocial')
    .populate('agencia', 'rfc razonSocial')
    .populate('transportista', 'rfc razonSocial')
    .populate({
      path: 'viaje',
      select: 'viaje buque naviera',
      match: json2,
    })
    .populate('usuarioAlta', 'nombre email')
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        // maniobras: maniobras,
        // total: maniobras.length
        maniobras: maniobras.filter(x => x.viaje != null),
        total: maniobras.filter(x => x.viaje != null).length
      });
    });
});


app.get('/xviaje/:idviaje/importacion', (req, res, netx) => {
  //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
  var idViaje = req.params.idviaje;
  Maniobra.find({ "viaje": idViaje, "peso": { $ne: 'VACIO' }, "estatus": 'APROBACION' })
    .populate('cliente', 'rfc razonSocial')
    .populate('agencia', 'rfc razonSocial')
    .populate('transportista', 'rfc razonSocial')
    .populate('usuarioAlta', 'nombre email')
    .exec((err, maniobras) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando maniobras',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobras: maniobras,
        total: maniobras.length
      });
    });
});




// =======================================
// Obtener Maniobra de hoy
// =======================================
app.get('/hoy', (req, res, netx) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var fechaInicio = string;
  var myDate = new Date(fechaInicio).now();
  var y = myDate.getFullYear();
  var m = myDate.getMonth();
  m += 1;
  var d = myDate.getUTCDate();
  var newdate = (y + "-" + m + "-" + d);
  //fechaaInicio = new Date(fechaInicio).toISOString();
  // var inicioDate = fechaInicio + "T00:00:00.000Z";
  // fechaaFin = new Date(fechaFin).toISOString();
  var inicioDate = newdate + "T00:00:00.000Z";
  // fechaaFin = new Date(inicioDate);
  //    .find({"fecha" : {"$gt" : ISODate("2014-10-18T00:00:00")}})
  Maniobra.find({ "fechaCreado": { "$gt": inicioDate } })
    .populate('operador', 'operador')
    .populate({
      path: "camiones",
      select: 'placa numbereconomico',
      populate: {
        path: "transportista",
        select: 'nombre'
      }
    })
    .populate('contenedor', 'contenedor tipo')
    .populate('cliente', 'cliente')
    .populate('agencia', 'nombre')
    .populate('transportista', 'nombre')
    .populate('viaje', 'viaje')
    .populate('usuario', 'nombre email')
    .exec(
      (err, maniobras) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando maniobras',
            errors: err
          });
        }
        Maniobra.countDocuments({}, (err, conteo) => {
          res.status(200).json({
            ok: true,
            maniobras,
            total: conteo
          });

        });

      });
});


// =======================================
// Obtener Maniobra por rango de fechas
// =======================================
app.get('/rangofecha', (req, res, netx) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var fechaInicio = req.query.fechaInicio;
  var fechaFin = req.query.fechaFin;
  fechaaInicio = new Date(fechaInicio).toISOString();
  // var inicioDate = fechaInicio + "T00:00:00.000Z";
  // fechaaFin = new Date(fechaFin).toISOString();
  var finDate = fechaFin + "T23:59:59.999Z";
  fechaaFin = new Date(finDate);
  Maniobra.find({ "fechaCreado": { "$gte": fechaaInicio, "$lte": fechaaFin } })
    .populate('operador', 'operador')
    .populate({
      path: "camiones",
      select: 'placa numbereconomico',
      populate: {
        path: "transportista",
        select: 'nombre'
      }
    })
    .populate('cliente', 'cliente')
    .populate('agencia', 'nombre')
    .populate('transportista', 'nombre')
    .populate('viaje', 'viaje')
    .populate('usuario', 'nombre email')
    .exec(
      (err, maniobras) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando maniobras',
            errors: err
          });
        }
        Maniobra.countDocuments({}, (err, conteo) => {
          res.status(200).json({
            ok: true,
            maniobras,
            total: conteo
          });

        });

      });
});

// ==========================================
// Obtener todas las maniobras de vacio
// ==========================================

module.exports = app;

// app.get('/:viaje?&:peso?&:cargaDescarga?', (req, res) => {
//   // console.log('vacios')
//   // console.log(req.params)
//   var filtro = ParamsToJSON.ParamsToJSON(req);
//   //console.log(filtro)
//   Maniobra.find(filtro)
//     .populate('cliente', 'rfc razonSocial')
//     .populate('agencia', 'rfc razonSocial')
//     .populate('transportista', 'rfc razonSocial')
//     .populate('operador', 'nombre')
//     .populate('camion', 'placa')
//     .populate({
//       path: "viaje",
//       select: 'viaje fechaArribo',
//       populate: {
//         path: "buque",
//         select: 'nombre'
//       }
//     })
//     .populate('usuarioAlta', 'nombre email')
//     .exec((err, vacios) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'Error al buscar vacios',
//           errors: err
//         });
//       }
//       if (!vacios) {
//         return res.status(400).json({
//           ok: false,
//           mensaje: 'No existen maniobras de vacio para el viaje: ' + viaje,
//           errors: { message: "No existen maniobras de vacio" }
//         });
//       }
//       res.status(200).json({
//         ok: true,
//         vacios: vacios,
//         total: vacios.length
//       });
//     });

// });

// // ============================================
// // Obtener Maniobras por contenedor buque viaje
// // ============================================
// app.get('/buscaxcontenedorviaje', (req, res, netx) => {
//   console.log('buscaxcontenedorviaje')
//   var contenedor = req.query.contenedor.trim();
//   var viaje = req.query.viaje.trim();
//   var buque = req.query.buque.trim();
//   Maniobra.aggregate([{
//         $lookup: {
//           from: "viajes",
//           localField: "viaje",
//           foreignField: "_id",
//           as: "match"
//         }
//       },
//       {
//         $match: { "contenedor": contenedor, "match.viaje": viaje, "match.buque": new mongoose.Types.ObjectId(buque) }
//       },
//       {
//         $project: {
//           _id: 1,
//           contenedor: 1
//         }
//       }
//     ])
//     .exec(
//       (err, maniobra) => {
//         if (err) {
//           return res.status(500).json({
//             ok: false,
//             mensaje: 'Error cargando maniobras',
//             errors: err
//           });
//         }
//         res.status(200).json({
//           ok: true,
//           maniobra: maniobra
//         });


//       });
// });