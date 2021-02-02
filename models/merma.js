var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var subSchemaMateriales = new Schema({
    material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
    cantidad: { type: Schema.Types.Number, required: true },
  }, { _id: false });

var mermaSchema = new Schema({
  motivo: { type: String, required: true },
  materiales: [subSchemaMateriales],
  usuarioAprobacion: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAprobacion: { type: Date },
  comentarioAprobacion: { type: String },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date },
}, { collection: 'mermas' });

// mermaSchema.index({ noFactura: 1, proveedor: 1 }, { unique: true });
mermaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Merma', mermaSchema);