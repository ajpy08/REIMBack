var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var serieSchema = new Schema({
    serie: { type: String, required: true },
    folio: { type: Number, required: true },    
    tipoComprobante: { type: String, required: true }, 
    regimenFiscal: { type: Schema.Types.ObjectId, ref: 'RegimenFiscal' },
}, { collection: 'fac_Series' });

serieSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('Serie', serieSchema);