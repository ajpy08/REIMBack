var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var impuestoSchema = new Schema({
    TR: { type: String, required: true },
    impuesto: { type: String, required: true },
    cveImpuesto: { type: String, required: true },
    valor: { type: Number, required: true },    
    fAlta: { type: Date, default: Date.now }
}, { collection: 'buques' });

impuestoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('Impuesto', impuestoSchema);