var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var proveedorSchema = new Schema({
  rfc: { type: String },
  razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesario'] },
  alias: { type: String, unique: true, requiered: [true, 'El alias es necesario'] },
  activo: { type: Boolean, required: [true, 'El campo es obligatorio'] },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  fMod: { type: Date }
}, { collection: 'proveedores' });

proveedorSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Proveedor', proveedorSchema);