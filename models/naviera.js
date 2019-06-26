var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['NAVIERA_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var navieraSchema = new Schema({
    razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesario'] },
    rfc: { type: String, unique: true, required: [true, 'El RFC es necesario'] },
    calle: { type: String, requiered: [true, 'La calle es necesaria'] },
    numeroExterior: { type: String, required: [true, 'El numero exterior es necesario'] },
    numeroInterior: { type: String, required: false },
    colonia: { type: String, requiered: [true, 'La colonia es necesaria'] },
    municipioDelegacion: { type: String, requiered: [true, 'El Municio/Delegación es necesaria'] },
    ciudad: { type: String, requiered: [true, 'La ciudad es necesaria'] },
    estado: { type: String, requiered: [true, 'El estado es necesaria'] },
    cp: { type: String, requiered: [true, 'El codigo postal es necesaria'] },
    formatoR1: { type: String, required: false },
    correo: { type: String, requiered: [true, 'EL correo es necesaria'] },
    correoFac: { type: String, requiered: [true, 'El correo de facturación es necesaria'] },
    credito: { type: String, requiered: [true, 'EL credito es necesaria'] },
    img: { type: String, required: false },
    patente: { type: String, requiered: [true, 'La patente es necesaria'] },
    nombreComercial: { type: String, requiered: [true, 'EL nombre comercial es necesaria'] },
    role: { type: String, required: true, default: 'NAVIERA_ROLE', enum: rolesValidos },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'clientes' });

navieraSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Naviera', navieraSchema);