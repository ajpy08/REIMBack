var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var materialSchema = new Schema({
    descripcion: { type: String, required: [true, 'La descripción del material es necesario'] },
    unidadMedida: { type: Schema.Types.ObjectId, ref: 'Unidad', required: true },
    costo: { type: Schema.Types.Number, required: [true, 'El costo es obligatorio']},
    activo: {type: Boolean, default: true, required: [true, 'El campo activo es obligatorio']},
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'materiales' });

// materialSchema.index({descripcion: 1}, {unique: true});
materialSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Material', materialSchema);