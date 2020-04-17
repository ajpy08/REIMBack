var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var regimenFiscalSchema = new Schema({
    claveRegimenFiscal: { type: String, required: true },
    descripcion: { type: String, required: true },    
    Fisica: { type: Boolean, default: true, required: true }, 
    Moral: { type: Boolean, default: true, required: true },
}, { collection: 'fac_SAT_regimenesFiscales' });

regimenFiscalSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('RegimenFiscal', regimenFiscalSchema);