var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var metodoPagoSchema = new Schema({
    metodoPago: { type: Number, required: true },
    descripcion: { type: String, required: true }
}, { collection: 'fac_SAT_metodosPago' });

metodoPagoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('metodoPago', metodoPagoSchema);