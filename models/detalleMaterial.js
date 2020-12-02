var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var Entrada = require('../models/entrada');

var detalleMaterialSchema = new Schema({
  material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  cantidad: { type: Number, required: true },
  costo: { type: mongoose.Types.Decimal128, required: true, get: getCosto },
  entrada: { type: Schema.Types.ObjectId, ref: 'Entrada' },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
}, { collection: 'detallesMaterial' });

detalleMaterialSchema.pre('save', function (next) {
  var doc = this;

  // Entrada.updateOne({ "_id": new mongoose.Types.ObjectId(doc.entrada) }, {
  // $set: { "detalles.$": doc._id }
  Entrada.findOneAndUpdate({ _id: doc.entrada }, { $push: { detalles: { detalle: doc._id } } }, (err, entradaActualizada) => {
  }, (err, cont) => {
    if (err) {
      next();
    }
  });

  next();
});

function getCosto(value) {
  if (typeof value !== 'undefined') {
    return parseFloat(value.toString());
  }
  return value;
}

detalleMaterialSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('DetalleMaterial', detalleMaterialSchema);