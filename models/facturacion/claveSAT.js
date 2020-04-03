var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var claveSATSchema = new Schema({
    claveProdServ: { type: String, required: true },
    descripcion: { type: String, required: true },
    incluir_IVA_trasladado: { type: String, required: true },    
    incluir_IEPS_trasladado: { type: String, required: true },   
    palabras_similares: { type: String }
}, { collection: 'fac_SAT_clavesProdServ' });

claveSATSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('ClaveSAT', claveSATSchema);