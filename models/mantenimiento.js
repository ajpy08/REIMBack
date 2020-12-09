var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var SchemaFechas = new Schema({
  fIni: { type: Date },
  hIni: { type: String },
  fFin: { type: Date },
  hFin: { type: String },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now }
}, { _id: false });

var SchemaMateriales = new Schema({
  Material: { type: Schema.Types.ObjectId, ref: 'materiales' },
  descripcion: { type: String },
  cantidad: { type: Number },
  costo: { type: mongoose.Types.Decimal128 },
  precio: { type: mongoose.Types.Decimal128 },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now }
}, { _id: false });

var mantenimientoSchema = new Schema({
  maniobra: { type: Schema.Types.ObjectId, ref: 'Maniobra' },
  tipoMantenimiento: { type: String },
  tipoLavado: { type: String },
  cambioGrado: { type: Boolean },
  observacionesGenerales: { type: String },
  izquierdo: { type: String },
  derecho: { type: String },
  frente: { type: String },
  posterior: { type: String },
  interior: { type: String },
  piso: { type: String },
  techo: { type: String },
  puerta: { type: String },
  fechas: [SchemaFechas],
  materiales: [SchemaMateriales],
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
}, { collection: 'mantenimientos', toJSON: { getters: true, virtuals: true } });

mantenimientoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

mantenimientoSchema.virtual('observacionesCompleto')
  .get(function() {
    return `${this.observacionesGenerales}\n Izq: ${this.izquierdo}\n Der: ${this.derecho}\n Pos: ${this.posterior}\n Int: ${this.interior}`;
  });

module.exports = mongoose.model('Mantenimiento', mantenimientoSchema);