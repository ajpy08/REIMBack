var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var usoCFDISchema = new Schema({
  usoCFDI: { type: String, required: true },
  descripcion: { type: String, required: true },
  Fisica: { type: Boolean, required: true },
  Moral: { type: Boolean, required: true }
}, { collection: 'fac_SAT_usosCFDI' });

usoCFDISchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('UsoCFDI', usoCFDISchema);