var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var unidadSchema = new Schema({
    descripcion: { type: String, required: [true, 'La descripción del unidad es necesaria'] },
    clave: { type: String, required: [true, 'La clave es obligatoria'] },
    abreviacion: { type: String, required: [true, 'La abreviacion es obligatoria'] },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'unidadesMedida' });

// unidadSchema.index({descripcion: 1}, {unique: true});
unidadSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Unidad', unidadSchema);