var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var Serie = require('./serie');

var complementoSchema = new Schema({
  version: { type: String },
  serie: { type: String },
  folio: { type: Number },
  fecha: { type: Date },
  subtotal: { type: mongoose.Types.Decimal128, required: true },
  moneda: { type: String, default: 'MXN' },
  total: { type: mongoose.Types.Decimal128, required: true },
  tipoComprobante: { type: String },
  confirmacion: { type: String },

  // TIMBRADO //
  uuid: { type: String },
  NoSerieSat: { type: String },
  fechaCertificacion: { type: Date },
  cadenaOriginalSat: { type: String },
  selloSat: { type: String },
  selloEmisor: { type: String },
  rfcProvCer: { type: String },

  ////////////////////EMISOR////////////////////////
  // nombreEmisor: { type: String }, FALTA
  // regimenFiscal: { type: String }, FALTA
  // rfcEmisor: { type: String }, FALTA
  /////////////////////////////////////////////////

  ////////////////////RECEPTOR/////////////////////
  rfc: { type: String },
  nombre: { type: String },
  residenciaFiscal: { type: String },
  usoCFDI: { type: String },
//   direccion: { type: String },
//   correo: { type: String },
  /////////////////////////////////////////////////

  ////////////////////CONCEPTOS/////////////////////
  concepto: {
    cantidad: { type: Number },
    claveProdServ: { type: String },
    claveUnidad: { type: String },
    descripcion: { type: String },
    noIdentificacion: { type: String },
    importe: { type: mongoose.Types.Decimal128 },
    valorUnitario: { type: mongoose.Types.Decimal128 },
    impuestos: [{
      _id: false,
      TR: { type: String, required: true },
      importe: { type: mongoose.Types.Decimal128, required: true },
      impuesto: { type: String, required: true },
      tasaCuota: { type: mongoose.Types.Decimal128, required: true },
      tipoFactor: { type: String, default: 'Tasa', required: true },
    }],
    cfdis: [{
      _id: false,
      idCFDI: { type: Schema.Types.ObjectId, ref: 'cfdis' },
      uuid: {type: String, required: true}
    }],
    unidad: { type: String },
    descuento: { type: mongoose.Types.Decimal128 },
    maniobras: [{ type: Schema.Types.ObjectId, ref: 'Maniobra' }],
  },
  /////////////////////////////////////////////////

  versionPago: { type: String },
  fechaPago: { type: String },
  formaDePagoP: { type: String },
  monedaP: { type: String },
  tipoCambio: { type: String },
  monto: { type: mongoose.Types.Decimal128, required: true },
  numOperacion: { type: String },
  rfcEmisorCtaOrd: { type: String },
  nomBancoOrdExt: { type: String },
  ctaOrdenante: { type: String },
  rfcEmisorCtaBen: { type: String },
  ctaBeneficiario: { type: String },
  TipoCadPago: { type: String },
  CertPago: { type: String },
  CadPago: { type: String },
  selloPago: { type: String },

  doctosRelacionados: [{}],



  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date },
  informacionAdicional: { type: String },
  fechaEmision: { type: String },
  xmlTimbrado: { type: String },

  /// NOTAS DE CREDITO ////
//   tipoRelacion: { type: String },
//   notaDeCreditoRelacionada: { type: Schema.Types.ObjectId, ref: 'cfdis' },
}, { collection: 'cfdis' });

complementoSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
complementoSchema.pre('save', function (next) {
  var doc = this;
  if (doc._id !== undefined) {
    Serie.findOneAndUpdate({ serie: doc.serie }, { $inc: { folio: 1 } }, function (error, cont) {
      if (error)
        return next(error);
      // doc.folio = cont.seq;
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model('Complemento', complementoSchema);