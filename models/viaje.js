var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var Maniobra = require('./maniobra');
var moment = require('moment');

var viajeSchema = new Schema({
  anio: { type: Number },
  viaje: { type: String, required: [true, 'El viaje es necesario'] },
  buque: { type: Schema.Types.ObjectId, ref: 'Buque', required: [true, 'El buque es necesario'] },
  naviera: { type: Schema.Types.ObjectId, ref: 'Naviera' },
  fArribo: { type: Date },
  fVigenciaTemporal: { type: Date },
  contenedores: { type: [] },
  pdfTemporal: { type: String, required: false },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: new Date() },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date },
}, { collection: 'viajes' });

//viajeSchema.pre(['remove'], function(next) {
viajeSchema.pre('remove', function(next) {
  Maniobra.remove({ 'viaje': this._id }).exec();
  next();
});

viajeSchema.index({ anio: 1, viaje: 1, buque: 1 }, { unique: true });
viajeSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Viaje', viajeSchema);