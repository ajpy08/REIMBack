var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var Contador = require('./contador');

var maniobraSchema = new Schema({

  cargaDescarga: { type: String, required: true, default: 'D' },
  folio: { type: Number },
  viaje: { type: Schema.Types.ObjectId, ref: 'Viaje' },
  agencia: { type: Schema.Types.ObjectId, ref: 'Cliente' },
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente' },
  transportista: { type: Schema.Types.ObjectId, ref: 'Cliente' },
  camion: { type: Schema.Types.ObjectId, ref: 'Camion' },
  operador: { type: Schema.Types.ObjectId, ref: 'Operador' },
  contenedor: { type: String },
  tipo: { type: String },
  grado: { type: String },
  peso: { type: String },
  destinatario: { type: String, required: false },
  estatus: { type: String, default: 'APROBACIÓN' },
  fLlegada: { type: String },
  hLlegada: { type: String },
  hEntrada: { type: String },
  facturarA: { type: String },
  correoFac: { type: String },
  correoOp: { type: String },
  solicitud: { type: Schema.Types.ObjectId, ref: 'Solicitud' },
  hSalida: { type: String },
  lavado: { type: String },
  lavadoObservacion: { type: String },
  reparaciones: [{
    id: { type: Schema.Types.ObjectId, ref: 'reparacion' },
    reparacion: { type: String, required: [true, 'La reparacion es necesaria'] },
    costo: { type: String },
  }],
  reparacionesObservacion: { type: String },
  fTerminacionLavado: { type: String },
  hTerminacionLavado: { type: String },
  fTerminacionReparacion: { type: String },
  hTerminacionReparacion: { type: String },
  maniobraAsociada: { type: Schema.Types.ObjectId, ref: 'Maniobra' },
  facturaManiobra: { type: String },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fAlta: { type: Date, default: Date.now },
  usuarioModifico: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date },


}, { collection: 'maniobras' });

maniobraSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
maniobraSchema.pre('save', function(next) {
  var doc = this;
  if (this.peso != 'VACIO' && (this.folio === undefined || this.folio === '')) {
    Contador.findByIdAndUpdate({ _id: 'maniobras' }, { $inc: { seq: 1 } }, function(error, cont) {
      if (error)
        return next(error);
      doc.folio = cont.seq;
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model('Maniobra', maniobraSchema);