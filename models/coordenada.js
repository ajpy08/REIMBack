var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var coordenadaSchema = new Schema({
    bahia: { type: Number, required: [true, 'La bahia es necesaria'] },
    posicion: { type: String, requiered: [true, 'La posicion es necesaria'] },
    tipo: { type: Number, required: [true, 'El tipo (tamaño) es necesario'] },
    activo: {type: Boolean, default: true, required: [true, 'El campo es obligatorio']},
    maniobra: { type: Schema.Types.ObjectId, ref: 'Maniobra'},
    // usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    // fAlta: { type: Date, default: Date.now },
    // usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    // fMod: { type: Date }
}, { collection: 'coordenadas' });

coordenadaSchema.index({maniobra: 1, nombre: 1}, {unique: true});
coordenadaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Coordenada', coordenadaSchema);