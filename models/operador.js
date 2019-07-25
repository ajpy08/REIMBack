var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var operadorSchema = new Schema({
    transportista: { type: Schema.Types.ObjectId, ref: 'Transportista', required: [true, 'El transportista es necesario']},
    nombre: { type: String, required: [true, 'El nombre del operador es necesario'] },
    foto: { type: String, required: false },
    licencia: { type: String, required: false },
    vigenciaLicencia: { type: Date, required: false },
    fotoLicencia: { type: String, required: false },
    activo: {type: Boolean, required: [true, 'El campo es obligatorio']},
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'operadores' });

operadorSchema.index({transportista: 1, nombre: 1}, {unique: true});
operadorSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Operador', operadorSchema);