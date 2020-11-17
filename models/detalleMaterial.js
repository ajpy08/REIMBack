var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var detalleMaterialSchema = new Schema({
    material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
    cantidad: { type: Schema.Types.Number, required: [true, 'La cantidad es obligatoria']},
    costo: { type: Schema.Types.Number, required: [true, 'El costo es obligatorio']},    
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'detallesMaterial' });

detalleMaterialSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('detalleMaterial', detalleMaterialSchema);