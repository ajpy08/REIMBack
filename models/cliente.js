var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
  values: ['CLIENT_ROLE'],
  message: '{VALUE} no es un rol permitido'
};

var clienteSchema = new Schema({
  rfc: { type: String, required: [true, 'El RFC es necesario'] },
  razonSocial: { type: String, requiered: [true, 'La razon social es necesaria'] },
  nombreComercial: { type: String, requiered: false },
  calle: { type: String, requiered: false },
  noExterior: { type: String, required: false },
  noInterior: { type: String, required: false },
  colonia: { type: String, requiered: false },
  municipio: { type: String, requiered: false },
  ciudad: { type: String, requiered: false },
  estado: { type: String, requiered: [true, 'El estado es necesario'] },
  cp: { type: String, requiered: [true, 'El codigo postal es necesario'] },
  formatoR1: { type: String },
  correo: { type: String, requiered: false },
  correoFac: { type: String, requiered: false },
  credito: { type: Boolean, requiered: [true, 'EL credito es necesario'], default: false },
  img: { type: String, required: false },
  empresas: [{
    type: Schema.Types.ObjectId,
    ref: 'Cliente'
  }],
  role: { type: String, required: true, default: 'CLIENT_ROLE', enum: rolesValidos },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
}, { collection: 'clientes' });

clienteSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Cliente', clienteSchema);