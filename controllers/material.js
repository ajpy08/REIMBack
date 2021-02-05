var Entrada = require('../models/entrada');
var Merma = require('../models/merma');
var Mantenimiento = require('../models/mantenimiento');
exports.stock = function(req, res, fn) {
  var material = req.body.material.material;

  Entrada.find({ "detalles.material": material })
    .sort({ fAlta: -1 })
    .exec(
      (err, entrada) => {
        let stock = 0;
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al consultar las entradas.',
            errors: err
          });
        }
        if (entrada && entrada.length > 0)
          entrada.forEach(e => {
            e.detalles.forEach(d => {
              if (d.material._id == material) stock += d.cantidad;
            });
          });
        Merma.find({ 'materiales.material': material })
          .exec((err, mermas) => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar las mermas.',
                errors: err
              });
            }
            if (mermas && mermas.length > 0)
              mermas.forEach(m => {
                m.materiales.forEach(m => {
                  if (m.material._id == material) stock -= m.cantidad;
                });
              });
            Mantenimiento.find({ 'materiales.material': material })
              .exec((err, mat) => {
                if (err) {
                  return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar los Materiales de los MAntenimientos.',
                    errors: err
                  });
                }
                if (mat && mat.length > 0)
                  mat.forEach(m => {
                    m.materiales.forEach(m => {
                      if (m.material._id == material) stock -= m.cantidad;
                    });
                  });
                return fn(req, res, stock);
              });
          });
      });
};