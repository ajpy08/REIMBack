var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var entradaSchema = new Schema({
    noFactura: { type: String, required: [true, 'El No. de Factura es necesario'] },
    proveedor: { type: Schema.Types.ObjectId, ref: 'Proveedor' },
    fFactura: { type: Date },
    detalles: [{
        id: { type: Schema.Types.ObjectId, ref: 'detalleMaterial' }
      }],
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'entradas' });

entradaSchema.index({noFactura: 1, proveedor: 1}, {unique: true});
entradaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Entrada', entradaSchema);