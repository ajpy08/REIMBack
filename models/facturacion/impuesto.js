var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var impuestoSchema = new Schema({
    TR: { type: String, required: true },
    importe: { type: mongoose.Types.Decimal128, required: false }, 
    impuesto: { type: String, required: true },
    tasaCuota: { type: mongoose.Types.Decimal128, required: true }, 
    tipoFactor: { type: String, required: true },
    fAlta: { type: Date, default: Date.now }
    }, { collection: 'fac_SAT_impuestos' });
    
    impuestoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
    module.exports = mongoose.model('Impuesto', impuestoSchema); 
    