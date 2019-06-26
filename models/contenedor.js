var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var contenedorSchema = new Schema({
    contenedor: { type: String, unique: true, required: [true, 'El contenedor es necesario'] },
    tipo: { type: String, required: [true, 'El tipo es necesario'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'contenedores' });

contenedorSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Contenedor', contenedorSchema);