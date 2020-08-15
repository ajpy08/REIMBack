var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var vigenciaSchema = new Schema({
    contenedor:  { type: String, unique: true, required: [true, 'El contenedor es necesario'] },
    fManufactura: { type: Date, required: true },
    fVencimiento: { type: Date, required: true },
    observaciones: { type: String, required: false },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date },
    activo: {type: Boolean, required: [true, 'El campo es obligatorio']}
}, { collection: 'vigencias' });

vigenciaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
module.exports = mongoose.model('Vigencia', vigenciaSchema);