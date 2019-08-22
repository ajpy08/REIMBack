var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contadorSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 100 }
}, { collection: 'contadores' });

module.exports = mongoose.model('Contador', contadorSchema);