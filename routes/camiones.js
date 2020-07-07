var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Camion = require('../models/camion');
var Operador = require('../models/operador');
var Transportista = require('../models/transportista');
var Maniobra = require('../models/maniobra');
var variasBucket = require('../public/variasBucket');
var fs = require('fs');
var app = express();
var mongoose = require('mongoose');

// ==========================================
// Obtener todos los camiones
// Por el query podrian pasar como parametro el filtro por transportista        
// ==========================================

app.get('/',  mdAutenticacion.verificaToken, (req, res, next) => {
  var transportista = req.query.transportista || '';
  var act = req.query.act || '';

  var filtro = '{';
  if (transportista != 'undefined' && transportista != '')
    filtro += '\"transportista\":' + '\"' + transportista + '\",';

  if (act != 'undefined' && act !== '') {
    filtro += '\"activo\":' + '\"' + act + '\",';
  }
  if (filtro != '{')
    filtro = filtro.slice(0, -1);
  filtro = filtro + '}';
  var json = JSON.parse(filtro);

  Camion.find(json)
    .populate('usuarioAlta', 'nombre email')
    .populate('transportista', 'rfc razonSocial nombreComercial')
    .sort({ placa: 1 })
    .exec(
      (err, camiones) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar camiones',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          camiones: camiones,
          total: camiones.length
        });
      });
});

// ==========================================
//  Obtener Camiones por ID
// ==========================================
app.get('/camion/:id',  mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Camion.findById(id)
    .exec((err, camion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el camion',
          errors: err
        });
      }
      if (!camion) {
        return res.status(400).json({
          ok: false,
          mensaje: 'el camion con el id ' + id + 'no existe',
          errors: { message: 'No existe un camion con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        camion: camion
      });
    });
});

// ==========================================
// Crear nuevo Camión
// ==========================================
app.post('/camion/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  // console.log(body)
  var camion = new Camion({
    transportista: body.transportista,
    operador: body.operador,
    placa: body.placa,
    noEconomico: body.noEconomico,
    vigenciaSeguro: body.vigenciaSeguro,
    pdfSeguro: body.pdfSeguro,
    usuarioAlta: req.usuario._id,
    activo: body.activo
  });

  variasBucket.MoverArchivoBucket('temp/', camion.pdfSeguro, 'camiones/');

  camion.save((err, camionGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear camion',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      mensaje: 'Camion creado con éxito.',
      camion: camionGuardado
    });
  });
});

// ==========================================
// Actualizar Camión
// ==========================================
app.put('/camion/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  //console.log(body)
  Camion.findById(id, (err, camion) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar camion',
        errors: err
      });
    }
    if (!camion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Las camion con el id ' + id + ' no existe',
        errors: { message: 'No existe camion con ese ID' }
      });
    }
    camion.transportista = body.transportista;

    camion.operador = body.operador === '' ? undefined : body.operador;
    camion.placa = body.placa;
    camion.noEconomico = body.noEconomico;
    camion.vigenciaSeguro = body.vigenciaSeguro;
    camion.usuarioMod = req.usuario._id;
    camion.activo = body.activo;
    camion.fMod = new Date();


    if (camion.pdfSeguro != body.pdfSeguro) {
      if (variasBucket.MoverArchivoBucket('temp/', body.pdfSeguro, 'camiones/')) {
        if (camion.pdfSeguro != null && camion.pdfSeguro != undefined && camion.pdfSeguro != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('camiones/', camion.pdfSeguro);
        }
        camion.pdfSeguro = body.pdfSeguro;
      }
    }
    camion.save((err, camionGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar camion',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        camion: camionGuardado
      });
    });
  });
});

// ============================================
//   Borrar camion por el id
// ============================================
app.delete('/camion/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Maniobra.find({ $or: [{"camion": id}]})
    .exec(
      (err, maniobra) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al intentar validar la eliminacion el camion',
            errors: err
          });
        }
        if (maniobra && maniobra.length > 0) {
          res.status(400).json({
            ok: false,
            mensaje: 'El camión ya tiene operaciones registradas, por lo tanto no puede eliminarse.',
            errors: { message: 'El camión ya tiene operaciones registradas, por lo tanto no puede eliminarse.' },
            resultadoError: maniobra
          });
        } else {
          Operador.find({
            $or: [
              { "operador": id }
            ]
          })
            .exec(
              (err, operadores) => {
                if (err) {
                  return res.status(500).jason({
                    ok: false,
                    mensaje: 'Error al intentar cargar los operadores asociados.',
                    errors: err
                  });
                }
                if (operadores && operadores.length > 0) {
                  return res.status(400).json({
                    ok: false,
                    mensaje: 'Existen' + operadores.length + 'asociados, por lo tanto no se permite eliminar',
                    errors: { message: 'Existen' + operadores.length + 'operadores asociados, por lo tanto no se permite eliminar los camiones' },
                    resultadoError: operadores
                  });
                } else {
                  Transportista.find({
                    $or: [
                      { "transportista": id }
                    ]
                  })
                    .exec(
                      (err, transportistas) => {
                        if (err) {
                          return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al intentar cargar transportistas asociados',
                            errors: err
                          });
                        }
                        if (transportistas && transportistas.length > 0) {
                          return res.status(400).json({
                            ok: false,
                            mensaje: 'Existen' + transportistas.length + ' asociados, por lo tanto no se permite eliminar',
                            errors: { message: 'Existen' + transportistas.length + 'transportistas asoaciados, por lo tanto no se permite elinar los transportistas' },
                            resultadoError: transportistas
                          });
                        } else {
                          Camion.findByIdAndRemove(id, (err, camionBorrado) => {
                            if (err) {
                              return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al borrar camion',
                                errors: err
                              });
                            }
                            if (!camionBorrado) {
                              return res.status(400).json({
                                ok: false,
                                mensaje: 'No existe camion con ese id',
                                errors: { message: 'No existe camion con ese id' }
                              });
                            }
                            variasBucket.BorrarArchivoBucket('camiones/', camionBorrado.pdfSeguro);
                            res.status(200).json({
                              ok: true,
                              mensaje: 'Camion borrado con exito',
                              camion: camionBorrado
                            });
                          });
                        }
                      });
                }
              });
        }
      });
});


// =======================================
// Actualizar Camion  HABILITAR DESHABILITAR
// =======================================

app.put('/camionDes/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Camion.findById(id, (err, camion) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar camion',
        errors: err
      });
    }
    if (!camion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El camion con el id ' + id + ' no existe',
        errors: { message: 'El camion con el id' + id + ' no existe' }
      });
    }
    if (camion.activo === body.activo) {
      var hab = ''
      if (body.activo === 'true') {
        hab = 'Activo'
      } else {
        hab = 'Inactivo'
      }
      return res.status(400).json({
        ok: false,
        mensaje: 'El estatus del camion ya se encuentra en ' + hab,
        errors: {message: 'El estatus del camion ya se encuentra en ' + hab}
      })
    }
    camion.activo = body.activo;
    camion.save((err, camionGuardado) => {

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actializar el camion',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        camion: camionGuardado
      });
    });
  });
});

module.exports = app;