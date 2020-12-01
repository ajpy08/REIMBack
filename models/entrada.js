var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var DetalleMaterial = require('./detalleMaterial');
var Entrada = require('./entrada');

var subSchemaDetalle = mongoose.Schema({
  detalle: { type: Schema.Types.ObjectId, ref: 'detalleMaterial' },
  material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  cantidad: { type: Schema.Types.Number, required: [true, 'La cantidad es obligatoria'] },
  costo: {
    type: mongoose.Types.Decimal128,
    get: getCosto,
    required: [true, 'El costo es obligatorio']
  }
}, { _id: false });

var entradaSchema = new Schema({
  noFactura: { type: String, required: [true, 'El No. de Factura es necesario'] },
  proveedor: { type: Schema.Types.ObjectId, ref: 'Proveedor' },
  fFactura: { type: Date },
  detalles: [subSchemaDetalle],
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date }
}, { collection: 'entradas' });

entradaSchema.pre('save', function (next) {
  var doc = this;
  doc.detalles.forEach(function (element, index) {

    if (element.material && element.cantidad && element.costo > 0) {
      var detalleMaterial = new DetalleMaterial({
        material: element.material,
        cantidad: element.cantidad,
        costo: element.costo,
        entrada: doc._id,
        usuarioAlta: doc.usuarioAlta
      });

      doc.detalles[index].detalle = detalleMaterial._id;
      doc.detalles[index].material = undefined;
      doc.detalles[index].cantidad = undefined;
      doc.detalles[index].costo = undefined;

      detalleMaterial.save((err) => {
        if (err) {
          // console.log(err);
          return next(err);
        }
      });
    }
  });
  next();
});

entradaSchema.pre('remove', function (next) {
  try {
    DetalleMaterial.remove({ 'entrada': this._id }).exec();
    next();
  } catch (err) {
    next(err);
  }
});

function getCosto(value) {
  if (typeof value !== 'undefined') {
    return parseFloat(value.toString());
  }
  return value;
}

entradaSchema.index({ noFactura: 1, proveedor: 1 }, { unique: true });
entradaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Entrada', entradaSchema);