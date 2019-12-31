var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var registroSchema = new Schema({
    role: { type: String, required: [true, 'El Role es necesario']},
    razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesario'] },
    rfc: { type: String, required: [true, 'El RFC es necesario'] },
    direccionFiscal: { type: String, required: [true, 'La Dirección Fiscal es necesaria'] },
    correo: { type: String},
    nombre: { type: String },
    correoO: { type: String },
    correoF: { type: String },
    datosPersonales: { type: [{}], required:[true, 'Nombre y Correo son necesarios '] },
    correoFacturacion: { type: [{}], required: [true, 'Corre de Facturación es necesario'] },
    correoOperativo: { type: [{}], required: [true, 'Correo Operativo es necesario'] },
    codigo: { type: String, required: [true, 'Es necesario'] },
    fAlta: { type: Date, default: Date.now }

}, { collection: 'registro' });

module.exports = mongoose.model('Registro', registroSchema);

