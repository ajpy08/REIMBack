var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var tiposComprobanteSchema = new Schema({
    tipoComprobante: { type: String, required: true },
    descripcion: { type: String, required: true }
}, { collection: 'fac_SAT_tiposComprobante' });

tiposComprobanteSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('TipoComprobante', tiposComprobanteSchema);