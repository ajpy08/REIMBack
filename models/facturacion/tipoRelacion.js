var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var tipoRelacionSchema = new Schema({
    clave: {type: String},
    descripcion: {type: String}
}, {collection: 'fac_SAT_tipoRelacionCFDI'});
module.exports = mongoose.model('TipoRelacion',tipoRelacionSchema);