var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

// var Serie = require('./serie');

var cfdiSchema = new Schema({
    serie: { type: String },
    folio: { type: String },
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
    // conceptos: [{
    //     productoServicio: { type: Schema.Types.ObjectId, ref: 'ProductoServicio' },
    //     unidad: { type: String },
    //     cantidad: { type: String },
    //     valorUnitario: { type: String },
    //     impuestos: { type: String },
    //     importe: { type: String },
    //     descuento: { type: String },
    //     maniobras: { type: String }
    // }],
    // conceptos: { type: [{}], required: [true, 'Los conceptos son necesarios'] },
    conceptos: [{
        descripcion: { type: String },
        unidad: { type: String },
        cantidad: { type: String },
        valorUnitario: { type: String },
        impuestos: { type: String },
        importe: { type: String },
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

// cfdiSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });
// cfdiSchema.pre('save', function (next) {
//     var doc = this;
//     if (this.cargaDescarga === 'D' && this.peso != 'VACIO' && (this.folio === undefined || this.folio === '') ||
//         (this.cargaDescarga === 'C' && (this.folio === undefined || this.folio === ''))) {
//         Serie.findByIdAndUpdate({ _id: 'maniobras' }, { $inc: { seq: 1 } }, function (error, cont) {
//             if (error)
//                 return next(error);
//             doc.folio = cont.seq;
//             next();
//         });
//     } else {
//         next();
//     }
// });

module.exports = mongoose.model('CFDI', cfdiSchema);