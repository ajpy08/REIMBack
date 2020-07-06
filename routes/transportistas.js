var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Transportista = require('../models/transportista');
var Operador = require('../models/operador');
var Camion = require('../models/camion');
var variasBucket = require('../public/variasBucket');
var fs = require('fs');
var app = express();
var Maniobra = require('../models/maniobra');

// ==========================================
// Obtener todos los transportistas
// ==========================================
app.get('/:tf', mdAutenticacion.verificaToken, (req, res, next) => {
  var role = 'TRANSPORTISTA_ROLE';
  var tf = req.params.tf;
  Transportista.find({ role: role, "activo": tf })
    .populate('usuarioAlta', 'nombre email')
    .populate('usuarioMod', 'nombre email')
    .sort({ nombreComercial: 1 })
    .exec(
      (err, transportistas) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar transportistas',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          transportistas: transportistas,
          total: transportistas.length
        });

      });
});

// ==========================================
// Obtener transportistas por ID
// ==========================================
app.get('/transportista/:id',mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Transportista.findById(id)
    .exec((err, transportista) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar transportista',
          errors: err
        });
      }
      if (!transportista) {
        return res.status(400).json({
          ok: false,
          mensaje: 'La transportista con el id ' + id + 'no existe',
          errors: { message: 'No existe un transportista con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        transportista: transportista
      });
    });
});


// ==========================================
// Crear nuevo transportista
// ==========================================
app.post('/transportista/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var transportista = new Transportista({
    rfc: body.rfc,
    razonSocial: body.razonSocial,
    nombreComercial: body.nombreComercial,
    calle: body.calle,
    noExterior: body.noExterior,
    noInterior: body.noInterior,
    colonia: body.colonia,
    municipio: body.municipio,
    ciudad: body.ciudad,
    estado: body.estado,
    cp: body.cp,
    formatoR1: body.formatoR1,
    correo: body.correo,
    correoFac: body.correoFac,
    credito: body.credito,
    caat: body.caat,
    img: body.img,
    usoCFDI: body.usoCFDI,
    usuarioAlta: req.usuario._id,
    activo: req.activo
  });

  variasBucket.MoverArchivoBucket('temp/', transportista.img, 'clientes/');
  variasBucket.MoverArchivoBucket('temp/', transportista.formatoR1, 'clientes/');

  transportista.save((err, transportistaGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear Transportista',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      mensaje: 'Transportista Creado Con éxito.',
      transportista: transportistaGuardado
    });
  });
});

// ==========================================
// Actualizar transportista
// ==========================================
app.put('/transportista/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;
  Transportista.findById(id, (err, transportista) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar transportista',
        errors: err
      });
    }
    if (!transportista) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El transportista con el id ' + id + ' no existe',
        errors: { message: 'No existe transportista con ese ID' }
      });
    }
    transportista.rfc = body.rfc;
    transportista.razonSocial = body.razonSocial;
    transportista.nombreComercial = body.nombreComercial;
    transportista.calle = body.calle;
    transportista.noExterior = body.noExterior;
    transportista.noInterior = body.noInterior;
    transportista.colonia = body.colonia;
    transportista.municipio = body.municipio;
    transportista.ciudad = body.ciudad;
    transportista.estado = body.estado;
    transportista.cp = body.cp;
    transportista.correo = body.correo;
    transportista.correoFac = body.correoFac;
    transportista.credito = body.credito;
    transportista.caat = body.caat;
    transportista.usoCFDI = body.usoCFDI;
    transportista.usuarioMod = req.usuario._id;
    transportista.fMod = new Date();

    if (transportista.formatoR1 != body.formatoR1) {
      if (variasBucket.MoverArchivoBucket('temp/', body.formatoR1, 'clientes/')) {
        if (transportista.formatoR1 != null && transportista.formatoR1 != undefined && transportista.formatoR1 != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('clientes/', transportista.formatoR1);
        }
        transportista.formatoR1 = body.formatoR1;
      }
    }

    if (transportista.img != body.img) {
      if (variasBucket.MoverArchivoBucket('temp/', body.img, 'clientes/')) {
        if (transportista.img != null && transportista.img != undefined && transportista.img != '') { //BORRAR EL ACTUAL
          variasBucket.BorrarArchivoBucket('clientes/', transportista.img);
        }
        transportista.img = body.img;
      }
    }


    transportista.save((err, transportistaGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar transportista',
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        mensaje: 'Transportista actualizado con exito',
        transportista: transportistaGuardado
      });
    });
  });
});

// ============================================
//   Desactivar Operadores / Camiones 
// ============================================

// app.put('/desactivar/:id&:CO', (req, res) => {
//   var id = req.params.id;
//   var CO = req.params.CO;

//   if (CO === 'operador') {
//     Operador.findById(id, (err, operadores) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'Error al buscar Operador',
//           errors: err
//         });
//       }
//       if (!operadores) {
//         return res.json(400).json({
//           ok: false,
//           mensaje: 'El operador con el id' + id + ' no existe',
//           errors: err
//         });
//       }

//       operadores.activo = false
//       operadores.save((err, operadorGuardado) => {
//         if (err) {
//           return res.status(400).json({
//             ok: false,
//             mensaje: 'Error al actualizar Operador',
//             errors: err
//           });
//         }

//         res.status(200).json({
//           ok: true,
//           mensaje: 'Operador actualizado con Exito !!',
//           operador: operadorGuardado
//         })
//       })
//     });
//   } else if (CO === 'camion') {
//     Camion.findById(id, (err, camiones) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'error al buscar Camion',
//           errors: err
//         });
//       }
//       if (!camiones) {
//         return res.status(400).json({
//           ok: false,
//           mensaje: 'El Camion con el di ' + id + ' no existe',
//           errors: { message: 'el camion con el id ' + id + ' no existe' }
//         });
//       }

//       camiones.activo = false
//       camiones.save((err, camionGuardado) => {
//         if (err) {
//           return res.status(400).json({
//             ok: false,
//             mensaje: 'error al actualizar el camion',
//             errors: err
//           });
//         }
//         res.status(200).json({
//           ok: true,
//           camion: camionGuardado
//         });
//       });
//     });
//   }

// });


// ============================================
//   Borrar transportistas por el id
// ============================================
app.delete('/transportista/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Maniobra.find({
    $or: [
      { "transportista": id }
    ]
  }).exec((err, maniobras) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al intentar cargar maniobras asociadas.',
        errors: err
      });
    }
    if (maniobras && maniobras.length > 0) {
       res.status(400).json({
        ok: false,
        mensaje: 'Existen ( ' + maniobras.length + ' ) maniobras asociadas, por lo tanto no se permite eliminar.',
        errors: err,
        resultadoError: maniobras
      });
    } else {
      Operador.find({
        $or: [
          { "transportista": id, "activo": true }
        ]
      })
        .exec(
          (err, operadores) => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Error al intentar cargar operadores asociados.',
                errors: err

              });
            }
            if (operadores && operadores.length > 0) {
              res.status(400).json({
                ok: false,
                mensaje: 'Existen ' + operadores.length + ' Operadores asociados, por lo tanto no se permite eliminar.',
                errors: err,
                resultadoError: operadores
                // errors: { message: 'Existen ' + operadores.length + ' operadores asociados a trasportistas, por lo tanto no se puede eliminar.' }
              });
            } else {
              Camion.find({
                $or: [
                  { "transportista": id, "activo": true }
                ]
              })
                .exec(
                  (err, camiones) => {
                    if (err) {
                      return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al intentar cargar camiones asociados.',
                        errors: err
                      });
                    }
                    if (camiones && camiones.length > 0) {
                      res.status(400).json({
                        ok: false,
                        mensaje: 'Existen ' + camiones.length + ' Camiones asociados, por lo tanto no se permite eliminar.',
                        errors: err,
                        resultadoError: camiones
                        // errors: { message: 'Existen ' + camiones.length + ' camiones asociados a trasportistas, por lo tanto no se puede eliminar.' }
                      });
                    } else {
                      Transportista.findByIdAndRemove(id, (err, transportistaBorrado) => {
                        if (err) {
                          return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al borrar transportista',
                            errors: err
                          });
                        }
                        if (!transportistaBorrado) {
                          return res.status(400).json({
                            ok: false,
                            mensaje: 'No existe transportista con ese id',
                            errors: { message: 'No existe transportista con ese id' }
                          });
                        }
                        variasBucket.BorrarArchivoBucket('clientes/', transportistaBorrado.img);
                        variasBucket.BorrarArchivoBucket('clientes/', transportistaBorrado.formatoR1);
                        res.status(200).json({
                          ok: true,
                          transportista: transportistaBorrado
                        });
                      });
                    }
                  })
            }
          });
    }
  });
});

// ============================================
//   ACTIVAR_DESACTIVAR transportistas por el id
// ============================================

app.put('/transportista/:id&:act/habilita_deshabilita', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var act = req.params.act;

  Transportista.findById(id, (err, transportista) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar Transportista',
        errors: err
      });
    }

    if (!transportista) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El transportista con el ID ' + id + ' no existe',
        errors: { message: 'El transportista con el ID ' + id + ' no existe' }
      });
    }
    var activo = transportista.activo.toString();
    if (activo === act) {
      var hab = ''
      if (act === 'true') {
        hab = 'Activo'
      } else {
        hab = 'Inactivo'
      }
      return res.status(400).json({
        ok: false,
        mensaje: 'El estatus del transportista' +  transportista.nombreComercial + ' ya se encuentra en estatus' + hab, 
        errors: {message:'El estatus del transportista' +  transportista.nombreComercial + ' ya se encuentra en estatus' + hab }
      });
    }
    transportista.activo = act
    transportista.save((err, transportistaGuardado) => {

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar al transportista',
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        transportista: transportistaGuardado,
      });
    });
  });
});
module.exports = app;