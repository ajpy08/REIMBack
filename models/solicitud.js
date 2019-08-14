var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var solicitudScheme = new Schema({
  agencia: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  naviera: { type: Schema.Types.ObjectId, ref: 'Cliente' },
  transportista: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  facturarA: { type: Schema.Types.ObjectId, ref: 'Cliente', required: false },
  buque: { type: Schema.Types.ObjectId, ref: 'Buque' },
  blBooking: { type: String, requiered: [true, 'EL BL/Booking es necesario'] },
  viaje: { type: String },
  observaciones: { type: String },
  rutaBL: { type: String },
  credito: { type: Boolean, default: 'false', required: true },
  rutaComprobante: { type: String },
  correo: { type: String, requiered: [true, 'EL correo es necesaria'] },
  correoFac: { type: String, requiered: [true, 'EL correo de factura es necesaria'] },
  contenedores: [{
    contenedor: { type: String },
    tipo: { type: String },
    estado: { type: String },
    maniobra: { type: String },
    grado: { type: String }
  }],
  tipo: { type: String, default: 'D' },
  estatus: { type: String, default: 'NA' },
  usuarioAprobo: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAprobacion: { type: Date },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
}, { collection: 'solicitudes' });

solicitudScheme.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Solicitud', solicitudScheme);