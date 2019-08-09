var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var Maniobra = require('./maniobra');


var viajeSchema = new Schema({
  anio: { type: Date, default: Date.now },
  viaje: { type: String, unique: true, required: [true, 'El viaje es necesario'] },
  buque: { type: Schema.Types.ObjectId, ref: 'Buque', required: true },
  naviera: { type: Schema.Types.ObjectId, ref: 'Naviera' },
  fArribo: { type: Date, default: Date.now },
  fVigenciaTemporal: { type: Date, default: Date.now },
  contenedores: { type: [] },
  pdfTemporal: { type: String, required: false },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date },
}, { collection: 'viajes' });
viajeSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })
module.exports = mongoose.model('Viaje', viajeSchema);