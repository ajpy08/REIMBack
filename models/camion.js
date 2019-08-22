var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var camionSchema = new Schema({
    transportista: { type: Schema.Types.ObjectId, ref: 'Transportista', required: [true, 'El Transportista es necesario'] },
    operador: { type: Schema.Types.ObjectId, ref: 'Operador'},
    placa: { type: String, unique: true, required: [true, 'Las placas son necesarias'] },
    noEconomico: { type: String, required: [true, 'El numero economico es necesario'] },
    vigenciaSeguro: { type: Date, required: false },
    pdfSeguro: { type: String, required: false },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'camiones' });

camionSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })
module.exports = mongoose.model('Camion', camionSchema);