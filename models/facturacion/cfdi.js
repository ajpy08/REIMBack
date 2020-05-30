var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var Serie = require('./serie');

var cfdiSchema = new Schema({
  ///////////////////COMPROBANTE/////////////////////
  fecha: { type: Date },
  folio: { type: Number },
  formaPago: { type: String },
  // lugarExpedicion: { type: String }, // FALTA
  metodoPago: { type: String },
  moneda: { type: String, default: 'MXN' },
  serie: { type: String },
  subtotal: { type: Number, required: true },
  tipoComprobante: { type: String },
  total: { type: Number, required: true },
 

  // version: { type: String }, // FALTA
  // noCertificado: { type: String }, // FALTA
  // sello: { type: String }, // FALTA
  // certificado: { type: String }, // FALTA
  /////////////////////////////////////////////////

  // TIMBRADO //
  uuid: {type: String },
  NoSerieSat: {type: String},
  fechaCertificacion: {type: Date},
  cadenaOriginalSat: {type: String},
  selloSat: {type: String},
  selloEmisor: {type: String},
  rfcProvCer: {type: String},

  ////////////////////EMISOR////////////////////////
  // nombreEmisor: { type: String }, FALTA
  // regimenFiscal: { type: String }, FALTA
  // rfcEmisor: { type: String }, FALTA
  /////////////////////////////////////////////////

  ////////////////////RECEPTOR/////////////////////
  nombre: { type: String },
  rfc: { type: String },
  usoCFDI: { type: String },
  direccion: { type: String },
  correo: { type: String },
  /////////////////////////////////////////////////

  ////////////////////CONCEPTOS/////////////////////
  conceptos: [{
    cantidad: { type: Number },
    claveProdServ: { type: String },
    claveUnidad: { type: String },
    descripcion: { type: String },
    noIdentificacion: { type: String },
    importe: { type: Number },
    valorUnitario: { type: Number },
    impuestos: [{
      TR: { type: String, required: true },
      importe: { type: Number, required: true },
      impuesto: { type: String, required: true },
      tasaCuota: { type: Number, required: true },
      tipoFactor: { type: String, default: 'Tasa', required: true },
    }],
    unidad: { type: String },
    descuento: { type: Number },
    maniobras: [{ type: Schema.Types.ObjectId, ref: 'Maniobra' }],
  }],
  /////////////////////////////////////////////////

  ////////////////////IMPUESTOS/////////////////////
  totalImpuestosRetenidos: { type: Number, required: true },
  totalImpuestosTrasladados: { type: Number, required: true },
  //////////////////////////////////////////////////

  sucursal: { type: String },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fAlta: { type: Date, default: Date.now },
  fechaEmision: {type: String},
  usuarioModifico: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date },
  xmlTimbrado: {type: String},
}, { collection: 'cfdis' });

cfdiSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
cfdiSchema.pre('save', function(next) {
  var doc = this;
  if (doc._id !== undefined) {
    Serie.findOneAndUpdate({ serie: doc.serie }, { $inc: { folio: 1 } }, function(error, cont) {
      if (error)
        return next(error);
      // doc.folio = cont.seq;
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model('CFDI', cfdiSchema);