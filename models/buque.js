var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var buqueSchema = new Schema({
    nombre: { type: String, required: true },
    naviera: { type: Schema.Types.ObjectId, ref: 'Naviera', required: true },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    activo: {type: Boolean, required: [true, 'El campo es obligatorio']},
    fMod: { type: Date }
}, { collection: 'buques' });

buqueSchema.index({nombre: 1, naviera: 1}, {unique: true});

buqueSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Buque', buqueSchema);