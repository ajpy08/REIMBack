var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var registroSchema = new Schema({
    role: { type: String },
    razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesario'] },
    rfc: { type: String, required: [true, 'El RFC es necesario'] },
    direccionFiscal: { type: String, required: [true, 'La Dirección Fiscal es necesaria'] },
    correo: { type: String},
    nombre: { type: String },
    correoO: { type: String },
    correoF: { type: String },
    datosPersonales: { type: [{}] },
    correoFacturacion: { type: [{}] },
    correoOperativo: { type: [{}] },
    codigo: { type: String, requiered: [true, 'Es necesario'] }

}, { collection: 'registro' });

module.exports = mongoose.model('Registro', registroSchema);

