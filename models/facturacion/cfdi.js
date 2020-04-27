var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var Serie = require('./serie');

var cfdiSchema = new Schema({
    serie: { type: String },
    folio: { type: Number },
    sucursal: { type: String },
    formaPago: { type: String },
    metodoPago: { type: String },
    moneda: { type: String, default: 'MXN' },
    tipoComprobante: { type: String },
    fecha: { type: Date },
    rfc: { type: String },
    nombre: { type: String },
    usoCFDI: { type: String },
    direccion: { type: String },
    correo: { type: String },
    conceptos: [{
        cantidad: { type: String },
        claveProdServ: { type: String },
        claveUnidad: { type: String },
        descripcion: { type: String },
        noIdentificacion: { type: String },
        importe: { type: String },
        valorUnitario: { type: String },
        impuestos: [{
            TR: { type: String, required: true },
            importe: { type: Number, required: true },
            impuesto: { type: String, required: true },
            tasaOCuota: { type: String, required: true },
            tipoFactor: { type: String, default: 'Tasa', required: true },
        }],
        unidad: { type: String },
        descuento: { type: String },
        maniobras: [{ type: Schema.Types.ObjectId, ref: 'Maniobra' }],
      }],
    subtotal: { type: Number, required: true },
    totalImpuestosRetenidos: { type: Number, required: true },
    totalImpuestosTrasladados: { type: Number, required: true },
    total: { type: Number, required: true },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fAlta: { type: Date, default: Date.now },
    usuarioModifico: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date },
}, { collection: 'cfdis' });

cfdiSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
cfdiSchema.pre('save', function (next) {
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

module.exports = mongoose.model('CFDI', cfdiSchema);