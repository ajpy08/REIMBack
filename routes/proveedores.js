var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Proveedor = require('../models/proveedor');

// ==========================================
// Obtener todos los Proveedores
// ==========================================
app.get('/:tf', mdAutenticacion.verificaToken, (req, res, next) => {
  var tf = req.params.tf;

  Proveedor.find({ "activo": tf })
    .populate('usuarioAlta', 'nombre email')
    .sort({ razonSocial: 1 })
    .exec((err, proveedores) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar los proveedores',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        proveedores: proveedores,
        total: proveedores.length
      });
    });
});

// ==========================================
//  Obtener Proveedor por ID
// ==========================================
app.get('/proveedor/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Proveedor.findById(id)
    .populate('usuarioAlta', 'nombre img email')
    .exec((err, proveedor) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar el proveedor',
          errors: err
        });
      }
      if (!proveedor) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El proveedor con el id ' + id + 'no existe',
          errors: { message: 'No existe un proveedor con ese ID' }
        });
      }
      res.status(200).json({
        ok: true,
        proveedor: proveedor
      });
    });
});

// ==========================================
// Crear nuevo Proveedor
// ==========================================
app.post('/proveedor/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;
  var proveedor = new Proveedor({
    rfc: body.rfc,
    razonSocial: body.razonSocial,
    activo: body.activo,
    usuarioAlta: req.usuario._id
  });
  proveedor.save((err, proveedorGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear proveedor',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      proveedor: proveedorGuardado
    });
  });
});

// ==========================================
// Actualizar Proveedor
// ==========================================
app.put('/proveedor/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Proveedor.findById(id, (err, proveedor) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar proveedor',
        errors: err
      });
    }
    if (!proveedor) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El proveedor con el id ' + id + ' no existe',
        errors: { message: 'No existe proveedor con ese ID' }
      });
    }
    proveedor.rfc = body.rfc;
    proveedor.razonSocial = body.razonSocial;
    proveedor.activo = body.activo;
    proveedor.usuarioMod = req.usuario._id;
    proveedor.fMod = new Date();
    proveedor.save((err, proveedorGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar proveedor',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        proveedor: proveedorGuardado
      });
    });
  });
});

// ============================================
//   Borrar Proveedor por el id
// ============================================
app.delete('/proveedor/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Proveedor.findByIdAndRemove(id, (err, proveedorBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el proveedor',
        errors: err
      });
    }
    if (!proveedorBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe proveedor con ese id',
        errors: { message: 'No existe proveedor con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      proveedor: proveedorBorrado
    });
  });

  // Maniobra.find({ $or: [{ "buque": id }] })
  //   .exec(
  //     (err, maniobra) => {
  //       if (err) {
  //         return res.status(500).json({
  //           ok: false,
  //           mensaje: 'Error al intentar validar la eliminacion el buque',
  //           errors: err
  //         });
  //       }
  //       if (maniobra && maniobra.length > 0) {
  //         res.status(400).json({
  //           ok: false,
  //           mensaje: 'El camión ya tiene operaciones registradas, por lo tanto no puede eliminarse.',
  //           errors: { message: 'El camión ya tiene operaciones registradas, por lo tanto no puede eliminarse.' },
  //           resultadoError: maniobra
  //         });
  //       } else {
  //         Viaje.find({ $or: [{ "buque": id }] }).exec(
  //           (err, viaje) => {
  //             if (err) {
  //               return res.status(500).json({
  //                 ok: false,
  //                 mensaje: 'Error al intentar cargar viaje asociado',
  //                 errors: err
  //               });
  //             }
  //             if (viaje && viaje.length > 0) {
  //               res.status(400).json({
  //                 ok: false,
  //                 mensaje: 'Existen' + viaje.length + '  asociados, por lo tanto no puede eliminarse.',
  //                 errors: { message: 'Existen' + viaje.length + '  asociados, por lo tanto no puede eliminarse.' },
  //                 resultadoError: viaje
  //               });
  //             } else {
  //               Buque.findByIdAndRemove(id, (err, buqueBorrado) => {
  //                 if (err) {
  //                   return res.status(500).json({
  //                     ok: false,
  //                     mensaje: 'Error al borrar buque',
  //                     errors: err
  //                   });
  //                 }
  //                 if (!buqueBorrado) {
  //                   return res.status(400).json({
  //                     ok: false,
  //                     mensaje: 'No existe buque con ese id',
  //                     errors: { message: 'No existe buque con ese id' }
  //                   });
  //                 }
  //                 res.status(200).json({
  //                   ok: true,
  //                   buque: buqueBorrado
  //                 });
  //               });
  //             }
  //           });
  //       }
  //     });
});


// =======================================
// HABILITA / DESHABILITA Proveedor
// =======================================
app.put('/proveedor/:id/habilita_deshabilita', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Proveedor.findById(id, (err, proveedor) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el proveedor',
        errors: err
      });
    }
    if (!proveedor) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El proveedor con el id ' + id + ' no existe',
        errors: { message: 'No existe un proveedor con ese ID' }
      });
    }
    proveedor.activo = body.activo;
    proveedor.save((err, proveedorGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el proveedor',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        mensaje: 'Proveedor Actualizado con éxito',
        proveedor: proveedorGuardado
      });
    });
  });
});

module.exports = app;