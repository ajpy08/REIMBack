var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var producto_servicioSchema = new Schema({
    codigo: { type: String, required: true },
    unidad: { type: Number, required: true },
    descripcion: { type: String, required: true },
    valorUnitario: { type: Number, required: true },
    claveSAT: { type: Schema.Types.ObjectId, ref: 'ClaveSAT', required: true },
    unidadSAT: { type: Schema.Types.ObjectId, ref: 'ClaveUnidad', required: true },
    // claveSAT: { type: String, required: true },
    // unidadSAT: { type: String, required: true },
    impuestos: { type: [{}] },
    fAlta: { type: Date, default: Date.now }
}, { collection: 'fac_ProductosServicios' });

producto_servicioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })
module.exports = mongoose.model('ProductoServicio', producto_servicioSchema);
