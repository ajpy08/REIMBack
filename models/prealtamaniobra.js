var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var prealtaScheme = new Schema({
    viaje: {
        type: Schema.Types.ObjectId,
        ref: 'Viaje',
        required: [true, 'El id Viaje es un campo obligatorio ']
    },
    transportista: { type: String, required: false },
    facturarA: { type: String, required: false },
    correoFac: { type: String },
    contenedor: { type: String, unique: false, required: [true, 'El contenedor es necesario'] },
    tipo: { type: String },
    estado: { type: String },
    destinatario: { type: String, required: false },
    estatus: { type: String, default: 'APROBACIÓN' },
    solicitudD: { type: Schema.Types.ObjectId, ref: 'Solicitud', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { collection: 'maniobras' });

prealtaScheme.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Prealta', prealtaScheme);