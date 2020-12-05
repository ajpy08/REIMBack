var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var materialSchema = new Schema({
    descripcion: { type: String, required: [true, 'La descripción del material es necesario'] },
    unidadMedida: { type: Schema.Types.ObjectId, ref: 'Unidad', required: true },
    costo: { type: mongoose.Types.Decimal128, required: [true, 'El costo es obligatorio'],  get: getDecimal},
    precio: { type: mongoose.Types.Decimal128, required: [true, 'El precio es obligatorio'],  get: getDecimal},
    activo: {type: Boolean, default: true, required: [true, 'El campo activo es obligatorio']},
    tipo: { type: String, required: [true, 'El tipo de material es obligatorio'] },
    minimo: { type: mongoose.Types.Decimal128, required: [true, 'El minimo es obligatorio'],  get: getDecimal},
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'materiales' });

// materialSchema.index({descripcion: 1}, {unique: true});
materialSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

function getDecimal(value) {
    if (typeof value !== 'undefined') {
      return parseFloat(value.toString());
    }
    return value;
  }

module.exports = mongoose.model('Material', materialSchema);