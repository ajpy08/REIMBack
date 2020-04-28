var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var formaPagoSchema = new Schema({
    formaPago: { type: String, required: true },
    descripcion: { type: String, required: true }
}, { collection: 'fac_SAT_formasPago' });

formaPagoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('FormaPago', formaPagoSchema);