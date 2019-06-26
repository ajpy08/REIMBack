var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var operadorSchema = new Schema({
    transportista: { type: Schema.Types.ObjectId, ref: 'Transportista' },
    operador: { type: String, unique: true, required: [true, 'El nombre del operador es necesario'] },
    img: { type: String, required: false },
    licencia: { type: String, required: false },
    vigenciaLicencia: { type: Date, required: false },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'operadores' });

operadorSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Operador', operadorSchema);