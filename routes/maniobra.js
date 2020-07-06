// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Maniobra = require('../models/maniobra');
var Solicitud = require('../models/solicitud');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var uuid = require('uuid/v1');

app.use(fileUpload());



// =======================================
// Crear Maniobra
// =======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

  var body = req.body;

  var maniobra = new Maniobra({
    entrada: body.entrada,
    salida: body.salida,
    inicio: body.inicio,
    fin: body.fin,
    transporte: body.transporte,
    lavado: body.lavado,
    rep: body.rep,
    grado: body.grado,
    sello: body.sello,
    operador: body.operador,
    camiones: body.camion,
    contenedor: body.contenedor,
    cliente: body.cliente,
    agencia: body.agencia,
    viaje: body.viaje,
    usuario: req.usuario._id

  });

  maniobra.save((err, maniobraGuardado) => {

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear maniobra',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      maniobra: maniobraGuardado
    });

  });

});


// =======================================
// Registra solicitud
// =======================================
app.put('/asigna_solicitud/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: { message: 'No existe una maniobra con ese ID' }
      });
    }
    //Aqui hay que poner una validacion para no poder asignar una maniobra que ya tenga solicitud...
    if (maniobra.solicitud != undefined && maniobra.solicitud != body.solicitud) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' ya esta asignada a la solicitud con id: ' + maniobra.solicitud,
        errors: { message: 'La maniobra con el id ' + id + ' ya esta asignada a la solicitud con id: ' + maniobra.solicitud }
      });
    }

    maniobra.transportista = body.transportista;
    maniobra.solicitud = body.solicitud;
    maniobra.estatus = "TRANSITO";
    maniobra.agencia = body.agencia;
    maniobra.cliente = body.cliente;
    maniobra.patio = body.patio;

    maniobra.save((err, maniobraGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardado
      });
    });
  });
});

// =======================================
// Asigna Chofer y camion
// =======================================
app.put('/asigna_camion_operador/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: { message: 'No existe una maniobra con ese ID' }
      });
    }
    maniobra.camion = body.camion;
    maniobra.operador = body.operador;
    maniobra.usuarioModifico = req.usuario._id;
    maniobra.save((err, maniobraGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardado
      });
    });
  });
});

// =======================================
// Fecha de Asignacion
// =======================================
app.put('/actualiza_fecha_asignacion/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: { message: 'No existe una maniobra con ese ID' }
      });
    }
    timeZone = moment().format('Z');
    console.log('timezone: ' + timeZone)
    maniobra.fAsignacionPapeleta = moment().utc();
    maniobra.fExpiracionPapeleta = moment().add(3, 'days').utc();
    // maniobra.fAsignacionPapeleta = moment().startOf('day').utc();
    // maniobra.fExpiracionPapeleta = moment().add(3, 'days').startOf('day').utc();
    maniobra.save((err, maniobraGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardado
      });
    });
  });
});

// =======================================
// Reasigna Transportista
// =======================================
app.put('/reasigna_transportista/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: { message: 'No existe una maniobra con ese ID' }
      });
    }
    maniobra.transportista = body.transportista;
    maniobra.camion = undefined;
    maniobra.operador = undefined;
    maniobra.save((err, maniobraGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardado
      });
    });
  });
});


// // =======================================
// // Actualizar Maniobra
// // =======================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Maniobra.findById(id, (err, maniobra) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }

    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: { message: 'No existe una maniobra con ese ID' }
      });
    }
    maniobra.camion = body.camion,
      maniobra.operador = body.operador,
      maniobra.estatus = body.estatus,
      maniobra.fLlegada = body.fLlegada,
      maniobra.hLlegada = body.hLlegada,
      maniobra.hEntrada = body.hEntrada,
      maniobra.hSalida = body.hSalida,
      maniobra.hDescarga = body.hDescarga,
      maniobra.grado = body.grado,
      maniobra.lavado = body.lavado,
      maniobra.lavadoObservacion = body.lavadoObservacion,
      maniobra.reparaciones = body.reparaciones,
      maniobra.reparacionesObservacion = body.reparacionesObservacion,
      maniobra.fIniLavado = body.fIniLavado,
      maniobra.hIniLavado = body.hIniLavado,
      maniobra.hFinLavado = body.hFinLavado,
      maniobra.fIniReparacion = body.fIniReparacion,
      maniobra.hIniReparacion = body.hIniReparacion,
      maniobra.fFinReparacion = body.fFinReparacion,
      maniobra.hFinReparacion = body.hFinReparacion,
      maniobra.sello = body.sello

    maniobra.save((err, maniobraGuardado) => {

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }


      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardado
      });
    });

  });

});

// // ================================================
// // ELIMINA LA MANIOBRA DE LA SOLICITUD YA APROBADA 
// // ================================================

app.delete('/eliminarManiobra/Solicitud/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Maniobra.findById(id)
    .exec((err, maniobra) => {
      if (err) {
        return res.status(500).json({

          ok: false,
          mensaje: 'Error al buscar la maniobra',
          errors: err

        });
      }
      if (!maniobra) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El maniobra con el id ' + id + 'no existe',
          errors: { message: 'No existe un maniobra con ese ID' }
        });
      }

      if (maniobra.estatus != "TRANSITO") {

        return res.status(400).json({
          ok: false,
          mensaje: { message: 'La maniobra no esta en TRANSITO' },
          errors: { message: 'La maniobra no esta en TRANSITO' }
        });
      }
      Maniobra.findByIdAndRemove(id, (err, maniobraBorrada) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar maniobra',
            errors: err
          });
        }

        if (!maniobraBorrada) {
          return res.status(400).json({
            ok: false,
            mensaje: 'No existe una maniobra con ese id',
            errors: { message: 'No existe una maniobra con ese id' }
          });
        }


        res.status(200).json({
          ok: true,
          maniobra: maniobraBorrada
        });
      });
    });
});

// // =======================================================================================
// // ELIMINAR SOLAMENTE LA SOLICITUD DE MANIOBRA DESCARGA X CADA UNO DE LOS ARRAY
// // =======================================================================================

app.put('/eliminarManiobra/Solicitud/Descarga/:id&:solicitud', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var solicitud = req.params.solicitud;



  Solicitud.findById(solicitud).exec((err, solicitudes) => {
    if (err) {
      return res.status(500).json ({
        ok: false,
        mensaje: 'Error al buscar solicictud',
        errors: err
      })
    } else {
      if (solicitudes.contenedores.length <= 1 ) {
        Solicitud.findByIdAndRemove(solicitud, (err, solicictudBorrada) => {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al borrar Solicictud Maniobra',
              errors: err
            });
          }
          if (!solicictudBorrada) {
            return res.status(400).json({
              ok: false,
              mensaje: 'No existe solicictuf con ese id',
              errors: { message: 'No existe solicictud con ese id' }
            });
          }
        })
      }
    }
  });

  Maniobra.findById(id)
    .exec((err, maniobra) => {
      if (err) {
        return res.status(500).json({

          ok: false,
          mensaje: 'Error al buscar la maniobra',
          errors: err

        });
      }
      if (!maniobra) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El maniobra con el id ' + id + 'no existe',
          errors: { message: 'No existe un maniobra con ese ID' }
        });
      }

      if (maniobra.estatus != "TRANSITO") {

        return res.status(400).json({
          ok: false,
          mensaje: { message: 'La maniobra no esta en TRANSITO' },
          errors: { message: 'La maniobra no esta en TRANSITO' }
        });
      }

      Maniobra.updateOne({ "_id": id }, { $set: { "estatus": "APROBACION", } }, (err, upd) => {
        if (err) {
          return err.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar el estatus de la maniobra' + id,
            errors: err
          });
        }

        Maniobra.updateOne({ "_id": id }, { $unset: { "fAsignacionPapeleta": '', 'fExpiracionPapeleta': '' } }, (err, maniobraUpdate) => {
          if (err) {
            return err.status(500).json({
              ok: false,
              mensaje: 'Error al actualizar el estatus de la maniobra' + id,
              errors: err
            });
          }
          else {
            Maniobra.updateOne({ "_id": id }, { $unset: { "solicitud": solicitud } }, (err, maniobraBorrada) => {
              if (err) {
                return res.status(500).json({
                  ok: false,
                  mensaje: 'Error al borrar solicitud',
                  errors: err
                });
              }

              if (!maniobraBorrada) {
                return res.status(400).json({
                  ok: false,
                  mensaje: 'No existe una maniobra con ese id',
                  errors: { message: 'No existe una maniobra con ese id' }
                });
              }


            });
          }
        });

      });
      res.status(200).json({
        ok: true,
        maniobra: maniobra
      });
    });
});


// // =======================================
// // Borrar Maniobra por id
// // =======================================

// app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

//   var id = req.params.id;
//   Maniobra.findByIdAndRemove(id, (err, maniobraBorrado) => {

//     if (err) {
//       return res.status(500).json({
//         ok: false,
//         mensaje: 'Error al borrar maniobra',
//         errors: err
//       });
//     }

//     if (!maniobraBorrado) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'No existe una maniobra con ese id',
//         errors: { message: 'No existe una maniobra con ese id' }
//       });
//     }

//     res.status(200).json({
//       ok: true,
//       maniobra: maniobraBorrado
//     });
//   });
// });








// =======================================
// Asigna Factura Maniobra
// =======================================
app.put('/asigna_factura/:id&:facturaManiobra', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var facturaManiobra = req.params.facturaManiobra;
  // console.log("El id es:" + id)
  // console.log("La factura es :" + facturaManiobra)
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: { message: 'No existe una maniobra con ese ID' }
      });
    }
    maniobra.facturaManiobra = facturaManiobra;

    maniobra.save((err, maniobraGuardada) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardada
      });
    });
  });
});

// =======================================
// Actualizar Maniobra    HABILITAR DESHABILITAR mostrarFotosReparacion
// =======================================

app.put('/:id/habilita_deshabilita_mostrarFotosReparacion', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar la maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: { message: 'No existe una maniobra con ese ID' }
      });
    }
    if (body.tipo === 'Naviera') {
      maniobra.mostrarFotosRNaviera = body.mostrarFotosRNaviera;
    } else if (body.tipo === 'AA') {
      maniobra.mostrarFotosRAA = body.mostrarFotosRAA;
    } else {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al actualizar la maniobra'
      });
    }

    maniobra.save((err, maniobraGuardada) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobraGuardada
      });
    });
  });
});

app.put('/:id/corrige_contenedor', (req, res) => {

  var id = req.params.id;
  var body = req.body;
  Maniobra.findById(id, (err, maniobra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar la maniobra',
        errors: err
      });
    }
    if (!maniobra) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La maniobra con el id ' + id + ' no existe',
        errors: { message: 'No existe una maniobra con ese ID' }
      });
    }
    maniobra.contenedor = maniobra.contenedor.replace(/ /g, "");
    maniobra.save((err, maniobraGuardada) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la maniobra',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mensaje: 'Maniora Actualizada con éxito',
        maniobra: maniobraGuardada
      });
    });
  });
});


// export
module.exports = app;