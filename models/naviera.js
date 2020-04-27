var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
  values: ['NAVIERA_ROLE'],
  message: '{VALUE} no es un rol permitido'
};

var navieraSchema = new Schema({
  razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesaria'] },
  // rfc: { type: String,  required: [true, 'El RFC es necesario'] },
  rfc: { type: String },
  nombreComercial: { type: String, requiered: [true, 'El nombre comercial o ALIAS es necesario'] },
  calle: { type: String, requiered: false },
  noExterior: { type: String, required: false },
  noInterior: { type: String, required: false },
  colonia: { type: String, requiered: false },
  municipio: { type: String, requiered: false },
  ciudad: { type: String, requiered: false },
  estado: { type: String, requiered: [true, 'El estado es necesaria'] },
  cp: { type: String, requiered: [true, 'El codigo postal es necesaria'] },
  formatoR1: { type: String, required: false },
  usoCFDI: { type: Schema.Types.ObjectId, ref: 'UsoCFDI', required: [true, 'El Uso CFDI es necesario'] },
  correo: { type: String, requiered: false },
  correoFac: { type: String, requiered: false },
  credito: { type: Boolean, requiered: [true, 'EL credito es necesaria'], default: false },
  img: { type: String, required: false },
  caat: { type: String, requiered: [true, 'El CAAT es necesario'] },
  role: { type: String, required: true, default: 'NAVIERA_ROLE', enum: rolesValidos },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date },
}, { collection: 'clientes' });

navieraSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Naviera', navieraSchema);