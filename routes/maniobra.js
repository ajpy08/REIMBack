// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment');
var mongoose = require('mongoose');
var app = express();
var Maniobra = require('../models/maniobra');

var fileUpload = require('express-fileupload');
var fs = require('fs');
var uuid = require('uuid/v1');

app.use(fileUpload());

// ==========================================
//  Obtener Maniobra por ID
// ==========================================
app.get('/:id', (req, res) => {
  var id = req.params.id;
  console.log(id)
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
          mensaje: 'La maniobra con el id ' + id + 'no existe',
          errors: { message: 'No existe maniobra con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        maniobra: maniobra
      });
    });
});


// ==========================================
//  Obtener Maniobra por ID CON INCLUDES
// ==========================================
app.get('/:id/includes', (req, res) => {
  var id = req.params.id;
  Maniobra.findById(id)
    .populate('operador', 'nombre foto')
    .populate('camion', 'placa noEconomico')
    .populate('operador', 'nombre licencia')
    .populate('cliente', 'razonSocial')
    .populate('agencia', 'razonSocial')
    .populate('transportista', 'razonSocial')
    .populate('viaje', 'viaje ')
    .populate('solicitud', 'viaje ')
    .populate({
      path: 'viaje',
      select: 'viaje',
      populate: {
        path: 'buque',
        select: 'nombre'
      }
    })


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
        mensaje: 'La maniobra con el id ' + id + 'no existe',
        errors: { message: 'No existe maniobra con ese ID' }
      });
    }
    res.status(200).json({
      ok: true,
      maniobra: maniobra
    });
  });
});


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
    maniobra.fAsignacionPapeleta = moment().startOf('day').utc();
    maniobra.fExpiracionPapeleta = moment().add(3, 'days').startOf('day').utc();
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

// =======================================
// Registra LLegada Contendor
// =======================================
app.put('/registra_llegada/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  if (body.transportista === undefined || body.transportista === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Se debe declarar el transportista',
      errors: { message: 'Se debe declarar el transportista' }
    });
  }
  if (body.camion === undefined || body.camion === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Se debe declarar el camion',
      errors: { message: 'Se debe declarar el camion' }
    });
  }
  if (body.operador === undefined || body.operador === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Se debe declarar el operador',
      errors: { message: 'Se debe declarar el operador' }
    });
  }
  if (body.fLlegada === undefined || body.fLlegada === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Se debe declarar la Fecha de Llegada',
      errors: { message: 'Se debe declarar la Fecha de Llegada' }
    });
  }
  if (body.hLlegada === undefined || body.hLlegada === '') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Se debe declarar la Hora de Llegada',
      errors: { message: 'Se debe declarar la Hora de Llegada' }
    });
  }
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
    maniobra.camion = body.camion;
    maniobra.operador = body.operador;
    maniobra.fLlegada = body.fLlegada;
    maniobra.hLlegada = body.hLlegada;
    maniobra.estatus = "ESPERA";
    if (body.hEntrada) {
      maniobra.hEntrada = body.hEntrada;
      maniobra.estatus = "REVISION";
    }


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
// Registra Lavado, reparaciones y descarga
// =======================================
app.put('/registra_descarga/:id', mdAutenticacion.verificaToken, (req, res) => {
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
    maniobra.lavado = body.lavado;
    if (maniobra.lavado) maniobra.lavadoObservacion = body.lavadoObservacion;

    maniobra.reparaciones = body.reparaciones;
    if (maniobra.reparaciones.length > 0)
      maniobra.reparacionesObservacion = body.reparacionesObservacion;

    maniobra.grado = body.grado;

    if (body.hSalida) {
      maniobra.hSalida = body.hSalida;
      maniobra.estatus = "LAVADO_REPARACION";
      if (!body.lavado && body.reparaciones.length == 0)
        maniobra.estatus = "DISPONIBLE";
    }

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
// Registra FINALIZACION DE Lavado, reparaciones 
// =======================================
app.put('/registra_fin_lav_rep/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  if (body.lavado) {
    if (body.hIniLavado && (body.fIniLavado === undefined || body.fIniLavado === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar hora de Inicio de lavado si no ha asignado Fecha de Inicio',
        errors: { message: 'No se puede asignar hora de Inicio de lavado si no ha asignado Fecha de Inicio' }
      });
    }

    if (body.hFinLavado && (body.fIniLavado === undefined || body.fIniLavado === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar hora de finalización de lavado si no ha asignado Fecha de Inicio',
        errors: { message: 'No se puede asignar hora de finalización de lavado si no ha asignado Fecha de Inicio' }
      });
    }
  }

  if (body.reparaciones.length > 0) {
    if (body.hIniReparacion && body.hIniReparacion !== '' && (body.fIniReparacion === undefined || body.fIniReparacion === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar hora de Inicio de reparación si no ha asignado Fecha de Inicio',
        errors: { message: 'No se puede asignar hora de Inicio de reparación si no ha asignado Fecha de Inicio' }
      });
    }

    if (body.fFinReparacion && (body.hIniReparacion === undefined || body.hIniReparacion === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar Fecha de Finalizacion reparación si no ha asignado Hora de Inicio',
        errors: { message: 'No se puede asignar Fecha de Finalizacion reparación si no ha asignado Hora de Inicio' }
      });
    }

    if (body.hFinReparacion && (body.fFinReparacion === undefined || body.fFinReparacion === '')) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede asignar Hora de Finalizacion reparación si no ha asignado Fecha de Finalización',
        errors: { message: 'No se puede asignar hora de Inicio de reparación si no ha asignado Fecha de Finalización' }
      });
    }
  }

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

    maniobra.lavado = body.lavado;
    if (maniobra.lavado) {
      maniobra.lavadoObservacion = body.lavadoObservacion;
      maniobra.fIniLavado = body.fIniLavado;
      maniobra.hIniLavado = body.hIniLavado;
      maniobra.hFinLavado = body.hFinLavado;
    } else {
      maniobra.lavadoObservacion = undefined;
      maniobra.fIniLavado = undefined;
      maniobra.hIniLavado = undefined;
      maniobra.hFinLavado = undefined;
    }

    maniobra.reparaciones = body.reparaciones;

    if (maniobra.reparaciones.length > 0) {
      maniobra.reparacionesObservacion = body.reparacionesObservacion;
      maniobra.fIniReparacion = body.fIniReparacion;
      maniobra.hIniReparacion = body.hIniReparacion;
      maniobra.fFinReparacion = body.fFinReparacion;
      maniobra.hFinReparacion = body.hFinReparacion;
    } else {
      maniobra.reparacionesObservacion = body.reparacionesObservacion;
      maniobra.fIniReparacion = undefined;
      maniobra.hIniReparacion = undefined;
      maniobra.fFinReparacion = undefined;
      maniobra.hFinReparacion = undefined;
    }

    maniobra.grado = body.grado;


    if (!maniobra.lavado && maniobra.reparaciones.length == 0 && maniobra.grado) {
      maniobra.estatus = "DISPONIBLE";
    }
    if (maniobra.lavado && maniobra.fIniLavado && maniobra.hFinLavado && maniobra.reparaciones.length > 0 && maniobra.fFinReparacion && maniobra.hFinReparacion && maniobra.grado) {
      maniobra.estatus = "DISPONIBLE";
    }
    if (maniobra.lavado && maniobra.fIniLavado && maniobra.hFinLavado && maniobra.reparaciones.length == 0 && maniobra.grado) {
      maniobra.estatus = "DISPONIBLE";
    }
    if (!maniobra.lavado && maniobra.reparaciones.length > 0 && maniobra.fFinReparacion && maniobra.hFinReparacion && maniobra.grado) {
      maniobra.estatus = "DISPONIBLE";
    }
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
// Registra Carga Contenedor
// =======================================
app.put('/registra_carga/:id', mdAutenticacion.verificaToken, (req, res) => {
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
    maniobra.maniobraAsociada = body.maniobraAsociada;
    maniobra.contenedor = body.contenedor;
    maniobra.tipo = body.tipo;
    maniobra.grado = body.grado;
    maniobra.estatus = "CARGADO";

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
// app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
//   var id = req.params.id;
//   var body = req.body;

//   Maniobra.findById(id, (err, maniobra) => {

//     if (err) {
//       return res.status(500).json({
//         ok: false,
//         mensaje: 'Error al buscar maniobra',
//         errors: err
//       });
//     }

//     if (!maniobra) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'La maniobra con el id ' + id + ' no existe',
//         errors: { message: 'No existe una maniobra con ese ID' }
//       });
//     }

//     maniobra.entrada = body.entrada,
//       maniobra.salida = body.salida,
//       maniobra.inicio = body.inicio,
//       maniobra.fin = body.fin,
//       maniobra.transporte = body.transporte,
//       maniobra.lavado = body.lavado,
//       maniobra.rep = body.rep,
//       maniobra.grado = body.grado,
//       maniobra.fechaModificado = Date.now(),
//       maniobra.operador = body.operador,
//       maniobra.placas = body.placas,
//       maniobra.contenedor = body.contenedor,
//       maniobra.cliente = body.cliente,
//       maniobra.agencia = body.agencia,
//       maniobra.viaje = body.viaje,
//       maniobra.usuario = req.usuario._id;


//     maniobra.save((err, maniobraGuardado) => {

//       if (err) {
//         return res.status(400).json({
//           ok: false,
//           mensaje: 'Error al actualizar la maniobra',
//           errors: err
//         });
//       }


//       res.status(200).json({
//         ok: true,
//         maniobra: maniobraGuardado
//       });
//     });

//   });

// });

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





// // ==========================================
// // Remover fotos lavado de la maniobra
// // ==========================================
// app.put('/removeimgl/:id&:img', mdAutenticacion.verificaToken, (req, res) => {

//   var id = req.params.id;
//   var body = req.body;
//   var img = { "img": req.params.img };

//   Maniobra.findByIdAndUpdate(id, { $pull: { imgl: img } }, (err, maniobra) => {


//     if (err) {
//       return res.status(500).json({
//         ok: false,
//         mensaje: 'Error al buscar maniobra',
//         errors: err
//       });
//     }

//     if (!maniobra) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'La maniobra con el id ' + id + ' no existe',
//         errors: { message: 'No existe maniobra con ese ID' }
//       });
//     } else {
//       res.status(201).json({
//         ok: true,
//         maniobra: maniobra
//       });
//     }
//   });

// });


// // ==========================================
// // Remover fotos lavado de la maniobra
// // ==========================================
// app.put('/removeimgr/:id&:img', mdAutenticacion.verificaToken, (req, res) => {

//   var id = req.params.id;
//   var body = req.body;
//   var img = { "img": req.params.img };

//   Maniobra.findByIdAndUpdate(id, { $pull: { imgr: img } }, (err, maniobra) => {


//     if (err) {
//       return res.status(500).json({
//         ok: false,
//         mensaje: 'Error al buscar maniobra',
//         errors: err
//       });
//     }

//     if (!maniobra) {
//       return res.status(400).json({
//         ok: false,
//         mensaje: 'La maniobra con el id ' + id + ' no existe',
//         errors: { message: 'No existe maniobra con ese ID' }
//       });
//     } else {
//       res.status(201).json({
//         ok: true,
//         maniobra: maniobra
//       });
//     }
//   });

// });


// ==========================================
// Subir fotos lavado de la maniobra
// ==========================================
app.put('/addimg/:id&:LR', (req, res, next) => {
  var id = req.params.id;
  var LR = req.params.LR;
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No selecciono nada',
      errors: { message: 'Debe de seleccionar una imagen' }
    });
  }

  // Obtener nombre del archivo
  var archivo = req.files.file;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];
  var nombreArchivo = `${uuid()}.${extensionArchivo}`;
  if (!fs.existsSync(`./uploads/maniobras/${id}/`)) { // CHECAMOS SI EXISTE LA CARPETA CORRESPONDIENTE.. SI NO, LO CREAMOS.
    fs.mkdirSync(`./uploads/maniobras/${id}/`);
  }
  if (!fs.existsSync(`./uploads/maniobras/${id}/${LR}/`)) { // CHECAMOS SI EXISTE LA CARPETA CORRESPONDIENTE.. SI NO, LO CREAMOS.
    fs.mkdirSync(`./uploads/maniobras/${id}/${LR}/`);
  }
  var path = `./uploads/maniobras/${id}/${LR}/${nombreArchivo}`;
  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover archivo',
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      mensaje: 'Archivo guardado!',
      nombreArchivo: nombreArchivo,
      path: path
    });
  });

});

// =======================================
// Asigna Factura Maniobra
// =======================================
app.put('/asigna_factura/:id&:facturaManiobra', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var facturaManiobra = req.params.facturaManiobra;
  console.log("El id es:" + id)
  console.log("La factura es :" + facturaManiobra)
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


// export
module.exports = app;