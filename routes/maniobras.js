// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Maniobra = require('../models/maniobra');


// =======================================
// Obtener Maniobras
// =======================================
app.get('/', (req, res, netx) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Maniobra.find({})
      .skip(desde)
      .limit(5)
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



app.get('/transito/', (req, res, netx) => {
  var desde = req.query.desde || 0;
  var contenedor = new RegExp(req.query.contenedor, 'i');
  desde = Number(desde);
  //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
  Maniobra.find({ "estatus": "TRANSITO" })
      .skip(desde)
      .limit(100)
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
          Maniobra.countDocuments({}, (err, conteo) => {
              res.status(200).json({
                  ok: true,
                  maniobras: maniobras,
                  total: conteo
              });
          });
      });
});

app.get('/espera/', (req, res, netx) => {
    var desde = req.query.desde || 0;
    var contenedor = new RegExp(req.query.contenedor, 'i');
    desde = Number(desde);
    //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
    Maniobra.find({ "estatus": "ESPERA" })
        .skip(desde)
        .limit(100)
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
            Maniobra.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    maniobras: maniobras,
                    total: conteo
                });
            });
        });
  });

  app.get('/revision/', (req, res, netx) => {
    var desde = req.query.desde || 0;
    var contenedor = new RegExp(req.query.contenedor, 'i');
    desde = Number(desde);
    //Maniobra.find({ "estatus": "APROBADO",maniobras: contenedor })
    Maniobra.find({ "estatus": "REVISION" })
        .skip(desde)
        .limit(100)
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
            Maniobra.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    maniobras: maniobras,
                    total: conteo
                });
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
module.exports = app;