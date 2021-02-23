var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var Material = require('../models/material');

var subSchemaDetalle = new Schema({
  detalle: { type: Schema.Types.ObjectId, ref: 'DetalleMaterial' },
  material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  cantidad: { type: Schema.Types.Number, required: true },
  costo: { type: mongoose.Types.Decimal128, required: true, get: getCosto },
}, { _id: false });

var entradaSchema = new Schema({
  noFactura: { type: String, required: true },
  proveedor: { type: Schema.Types.ObjectId, ref: 'Proveedor' },
  fFactura: { type: Date },
  fEntrada: { type: Date },
  detalles: [subSchemaDetalle],
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
}, { collection: 'entradas' });

entradaSchema.index({ noFactura: 1, proveedor: 1 }, { unique: true });
entradaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

entradaSchema.pre('save', function (next) {
  var doc = this;

  doc.detalles.forEach(function (detalle, index) {
    if (detalle.material) {
      Material.findById(detalle.material)
        .exec((err, material) => {
          if (err) {
            // valida error
          }
          if (!material) {
            // valida material no encontrado
          }

          if (true) {
            // if (material.costo < detalle.costo) {
            Material.findOneAndUpdate({ _id: detalle.material }, { costo: detalle.costo }, (err, materialActualizado) => {
            }, (err, cont) => {
              if (err)
                return next(err);
              next();
            });
          }
        });
    }
  });
  next();
});

// entradaSchema.pre('save', function (next) {
//   var doc = this;

//   doc.detalles.forEach(function (element, index) {
//     if (element.material && element.cantidad && element.costo > 0) {
//       try {
//         var detalle;
//         detalle = new DetalleMaterial({
//           material: element.material,
//           cantidad: element.cantidad,
//           costo: element.costo,
//           entrada: doc._id,
//           usuarioAlta: doc.usuarioAlta
//         });
//       } catch (err) {
//         next(err);
//       }

//       doc.detalles[index].detalle = detalle._id;
//       doc.detalles[index].material = undefined;
//       doc.detalles[index].cantidad = undefined;
//       doc.detalles[index].costo = undefined;

//       detalle.save((err) => {
//         if (err) {
//           // console.log(err);
//           return next(err);
//         }
//       });
//     }
//   });
//   next();
// });

// entradaSchema.pre('remove', function (next) {
//   try {
//     DetalleMaterial.remove({ 'entrada': this._id }).exec();
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

function getCosto(value) {
  if (typeof value !== 'undefined') {
    return parseFloat(value.toString());
  }
  return value;
}

module.exports = mongoose.model('Entrada', entradaSchema);