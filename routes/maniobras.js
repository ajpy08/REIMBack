// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Maniobra = require('../models/maniobra');
var ParamsToJSON = require('../public/varias');
var ObjectId = require('mongodb').ObjectID;


// =======================================
// Obtener Maniobras
// =======================================
app.get('/:cargadescarga?:estatus?:tranportista?:contenedor?', (req, res, netx) => {

  var cargadescarga = req.query.cargadescarga || '';
  var estatus = req.query.estatus || '';
  var transportista = req.query.transportista || '';
  var contenedor = req.query.contenedor || '';

  var filtro = '{\"estatus\":\"TRANSITO\",';

  if (cargadescarga != 'undefined' && cargadescarga != '')
    filtro += '\"cargaDescarga\":' + '\"' + cargadescarga + '\",';

  if (estatus != 'undefined' && estatus != '')
    filtro += '\"estatus\":' + '\"' + estatus + '\",';

  if (transportista != 'undefined' && transportista != '')
    filtro += '\"transportista\":' + '\"' + transportista + '\",';

  if (contenedor != 'undefined' && contenedor != '')
    filtro += '\"contenedor\":{ \"$regex\":' + '\".*' + contenedor + '\",\"$options\":\"i\"},';

  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);
  // console.log(json);

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
// Obtener Maniobras por contenedor buque viaje
// ============================================
app.get('/buscaxcontenedorviaje', (req, res, netx) => {

  var contenedor = req.query.contenedor.trim();
  var viaje = req.query.viaje.trim();
  var buque = req.query.buque.trim();
  Maniobra.aggregate([{
    $lookup: {
      from: "viajes",
      localField: "viaje",
      foreignField: "_id",
      as: "match"
    }
  },
  {
    $match: { "contenedor": contenedor, "match.viaje": viaje, "match.buque": new mongoose.Types.ObjectId(buque) }
  },
  {
    $project: {
      _id: 1,
      contenedor: 1
    }
  }
  ])
    .exec(
      (err, maniobra) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando maniobras',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          maniobra: maniobra
        });


      });
});

// app.get('/transito/', (req, res, netx) => {
//   Maniobra.find({ "estatus": "TRANSITO" })
//     .populate('cliente', 'rfc razonSocial')
//     .populate('agencia', 'rfc razonSocial')
//     .populate('transportista', 'rfc razonSocial')
//     .populate({
//       path: "viaje",
//       select: 'viaje fechaArribo',
//       populate: {
//         path: "buque",
//         select: 'nombre'
//       }
//     })
//     .populate('usuarioAlta', 'nombre email')
//     .exec((err, maniobras) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'Error cargando maniobras',
//           errors: err
//         });
//       }
//       res.status(200).json({
//         ok: true,
//         maniobras: maniobras,
//         total: maniobras.length
//       });
//     });
// });

// app.get('/espera/', (req, res, netx) => {
//   var desde = req.query.desde || 0;
//   var contenedor = new RegExp(req.query.contenedor, 'i');
//   desde = Number(desde);
//   //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
//   Maniobra.find({ "estatus": "ESPERA" })
//     .skip(desde)
//     .limit(100)
//     .populate('cliente', 'rfc razonSocial')
//     .populate('agencia', 'rfc razonSocial')
//     .populate('transportista', 'rfc razonSocial')
//     .populate({
//       path: "viaje",
//       select: 'viaje fechaArribo',
//       populate: {
//         path: "buque",
//         select: 'nombre'
//       }
//     })
//     .populate('usuarioAlta', 'nombre email')
//     .exec((err, maniobras) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'Error cargando maniobras',
//           errors: err
//         });
//       }
//       res.status(200).json({
//         ok: true,
//         maniobras: maniobras,
//         total: maniobras.length
//       });

//     });
// });

// app.get('/revision/', (req, res, netx) => {
//   var desde = req.query.desde || 0;
//   var contenedor = new RegExp(req.query.contenedor, 'i');
//   desde = Number(desde);
//   //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
//   Maniobra.find({ "estatus": "REVISION" })
//     .skip(desde)
//     .limit(100)
//     .populate('cliente', 'rfc razonSocial')
//     .populate('agencia', 'rfc razonSocial')
//     .populate('transportista', 'rfc razonSocial')
//     .populate({
//       path: "viaje",
//       select: 'viaje fechaArribo',
//       populate: {
//         path: "buque",
//         select: 'nombre'
//       }
//     })
//     .populate('usuarioAlta', 'nombre email')
//     .exec((err, maniobras) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'Error cargando maniobras',
//           errors: err
//         });
//       }

//       res.status(200).json({
//         ok: true,
//         maniobras: maniobras,
//         total: maniobras.length
//       });

//     });
// });

app.get('/lavado_reparacion/', (req, res, netx) => {
  Maniobra.find({ "estatus": "LAVADO_REPARACION" })
    .populate('cliente', 'rfc razonSocial')
    .populate('agencia', 'rfc razonSocial')
    .populate('transportista', 'rfc razonSocial')
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
app.get('/LR/:naviera?', (req, res, netx) => {

  var naviera = req.params.naviera || '';

  Maniobra.find({
    $or: [
      {lavado: {$in: ['E', 'B']}},
      {'reparaciones.1': {$exists: true}}
    ]
    })
    .populate('cliente', 'rfc razonSocial')
    .populate('agencia', 'rfc razonSocial')
    .populate('transportista', 'rfc razonSocial')
    .populate({
      path: "viaje",
      select: 'viaje ',
      match: { 'viaje.naviera': naviera },
      // populate: {
      //   path: "buque",
      //   select: 'nombre'
      // }
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

app.get('/contenedores/disponibles/', (req, res, netx) => {
  Maniobra.find({ "estatus": "DISPONIBLE" })
    .populate('cliente', 'rfc razonSocial')
    .populate('agencia', 'rfc razonSocial')
    .populate('transportista', 'rfc razonSocial')
    .populate({
      path: "viaje",
      select: 'viaje fVigenciaTemporal pdfTemporal',
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


app.get('/xcargar/', (req, res, netx) => {
  //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
  Maniobra.find({ "estatus": "XCARGAR" })
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
app.get('/:viaje?&:estado?&:cargaDescarga?', (req, res) => {
  var filtro = ParamsToJSON.ParamsToJSON(req);
  // var desde = req.query.desde || 0;
  // desde = Number(desde);
  //console.log({filtro})
  Maniobra.find(filtro)
    .populate('cliente', 'rfc razonSocial')
    .populate('agencia', 'rfc razonSocial')
    .populate('transportista', 'rfc razonSocial')
    .populate('operador', 'nombre')
    .populate('camion', 'placa')
    .populate({
      path: "viaje",
      select: 'viaje fechaArribo',
      populate: {
        path: "buque",
        select: 'nombre'
      }
    })
    .populate('usuarioAlta', 'nombre email')
    .exec((err, vacios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar vacios',
          errors: err
        });
      }
      if (!vacios) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No existen maniobras de vacio para el viaje: ' + viaje,
          errors: { message: "No existen maniobras de vacio" }
        });
      }
      res.status(200).json({
        ok: true,
        vacios: vacios,
        total: vacios.length
      });
    });

});
module.exports = app;