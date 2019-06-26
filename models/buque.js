var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var buqueSchema = new Schema({
    buque: { type: String, unique: true, required: false },
    naviera: { type: Schema.Types.ObjectId, ref: 'Naviera', unique: true, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { collection: 'buques' });

buqueSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Buque', buqueSchema);