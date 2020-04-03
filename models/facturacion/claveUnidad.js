var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var claveUnidadSchema = new Schema({
    claveUnidad: { type: String, required: true },
    nombre: { type: String, required: true },    
    descripcion: { type: String, required: true }, 
    nota: { type: String }
}, { collection: 'fac_SAT_clavesUnidad' });

claveUnidadSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('ClaveUnidad', claveUnidadSchema);