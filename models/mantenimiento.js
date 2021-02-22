const { text } = require('body-parser');
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const { stringify } = require('uuid');
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
  material: { type: Schema.Types.ObjectId, ref: 'Material' },
  descripcion: { type: String },
  cantidad: { type: Number },
  costo: { type: mongoose.Types.Decimal128, get: getDecimal },
  precio: { type: mongoose.Types.Decimal128, get: getDecimal },
  unidadMedida: { type: String },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
});

var mantenimientoSchema = new Schema({
  folio: { type: String, unique: [true, 'El folio ya se encuentra registrado'] },
  fileFolio: { type: String },
  maniobra: { type: Schema.Types.ObjectId, ref: 'Maniobra' },
  tipoMantenimiento: { type: String },
  tipoLavado: { type: String },
  cambioGrado: { type: Boolean },
  observacionesGenerales: { type: String },
  izquierdo: { type: String },
  derecho: { type: String },
  frente: { type: String },
  puerta: { type: String },
  piso: { type: String },
  techo: { type: String },
  interior: { type: String },

  fechas: [SchemaFechas],
  materiales: [SchemaMateriales],
  finalizado: { type: Boolean, default: false },
  fFinalizado: { type: Date },
  migrado: { type: Boolean, default: false },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
}, { collection: 'mantenimientos', toJSON: { getters: true, virtuals: true } });

mantenimientoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

mantenimientoSchema.virtual('observacionesCompleto')
  .get(function() {
    var completo = '';
    if (this.observacionesGenerales != '' && this.observacionesGenerales != undefined) completo += 'Generales: ' + this.observacionesGenerales + ';';
    if (this.izquierdo != '' && this.izquierdo != undefined) completo += 'Izquierdo: ' + this.izquierdo + ';';
    if (this.derecho != '' && this.derecho != undefined) completo += 'Derecho: ' + this.derecho + ';';
    if (this.frente != '' && this.frente != undefined) completo += 'Frente: ' + this.frente + ';';
    if (this.puerta != '' && this.puerta != undefined) completo += 'Puerta: ' + this.puerta + ';';
    if (this.piso != '' && this.piso != undefined) completo += 'Piso: ' + this.piso + ';';
    if (this.techo != '' && this.techo != undefined) completo += 'Techo: ' + this.techo + ';';
    if (this.interior != '' && this.interior != undefined) completo += 'Interior: ' + this.interior + ';';

    return completo;
    //return `${this.observacionesGenerales}\n Izq: ${this.izquierdo}\n Der: ${this.derecho}\n Pos: ${this.posterior}\n Int: ${this.interior}`;
  });

mantenimientoSchema.virtual('costoMateriales')
  .get(function() {
    let costo = 0;
    this.materiales.forEach(mat => {
      costo += mat.costo * mat.cantidad;
    });
    return costo;
  });
mantenimientoSchema.virtual('precioMateriales')
  .get(function() {
    let precio = 0;
    this.materiales.forEach(mat => {
      precio += mat.precio * mat.cantidad;
    });
    return precio;
  });
mantenimientoSchema.virtual('fInicial')
  .get(function() {
    let fecha = null;
    let fTemporal = new Date(2100, 1, 1);
    this.fechas.forEach(fec => {
      if (fec.fIni && fec.fIni <= fTemporal) {
        fecha = fec.fIni;
        fTemporal = fec.fIni;
      }
    });
    return fecha;
  });
mantenimientoSchema.virtual('fFinal')
  .get(function() {
    let fecha2 = null;
    let fTemporal2 = new Date(2000, 1, 1);
    this.fechas.forEach(fec => {
      if (fec.fFin && fec.fFin > fTemporal2) {
        fecha2 = fec.fFin;
        fTemporal2 = fec.fFin;
      }
    });
    return fecha2;
  });

function getDecimal(value) {
  if (typeof value !== 'undefined') {
    return parseFloat(value.toString());
  }
  return value;
}
module.exports = mongoose.model('Mantenimiento', mantenimientoSchema);