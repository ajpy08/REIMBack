var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var maniobraSchema = new Schema({
    cargaDescarga: { type: String, required: true, default: 'D'},
    viaje: { type: Schema.Types.ObjectId, ref: 'Viaje', required: [true, 'El id Viaje es un campo obligatorio '] },
    agencia: { type: Schema.Types.ObjectId, ref: 'Cliente' },
    cliente: { type: Schema.Types.ObjectId, ref: 'Cliente' },
    transportista: { type: Schema.Types.ObjectId, ref: 'Cliente' },
    camion: { type: Schema.Types.ObjectId, ref: 'Camion' },
    operador: { type: Schema.Types.ObjectId, ref: 'Operador' },
    contenedor: { type: String, required: [true, 'El id contenedor es un campo obligatorio '] },
    tipo: { type: String },
    grado: { type: String },
    estado: { type: String },
    destinatario: { type: String, required: false },
    estatus: { type: String, default: 'APROBACIÓN' },
    fLlegada: { type: String },
    hLlegada: { type: String },
    hEntrada: { type: String },
    facturarA: { type: String },
    correoFac: { type: String },
    correoOp: { type: String },
    solicitudD: { type: Schema.Types.ObjectId, ref: 'Solicitud' },
    hSalida: { type: String },
    lavado: { type: String },
    lavadoObservacion: { type: String },
    reparaciones: [{
        id: { type: Schema.Types.ObjectId, ref: 'reparacion' },
        reparacion: { type: String, required: [true, 'La reparacion es necesaria'] },
        costo: { type: String },
    }],
    reparacionesObservacion: { type: String },
    facturaManiobra: {type: String},
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fAlta: { type: Date, default: Date.now },
    usuarioModifico: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date },
}, { collection: 'maniobras' });

maniobraSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })
module.exports = mongoose.model('Maniobra', maniobraSchema);