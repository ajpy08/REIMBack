var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['CLIENT_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var clienteSchema = new Schema({
    rfc: { type: String, unique: true, required: [true, 'El RFC es necesario'] },
    razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesaria'] },
    nombreComercial: { type: String, requiered: [true, 'EL nombre comercial es necesario'] },
    calle: { type: String, requiered: [true, 'La calle es necesaria'] },
    noExterior: { type: String, required: [true, 'El numero exterior es necesario'] },
    noInterior: { type: String, required: false },
    colonia: { type: String, requiered: [true, 'La colonia es necesaria'] },
    municipio: { type: String, requiered: [true, 'El Municio/Delegación es necesaria'] },
    ciudad: { type: String, requiered: [true, 'La ciudad es necesaria'] },
    estado: { type: String, requiered: [true, 'El estado es necesaria'] },
    cp: { type: String, requiered: [true, 'El codigo postal es necesario'] },
    formatoR1: { type: String, required: false },
    correo: { type: String, requiered: [true, 'El correo es necesario'] },
    correoFac: { type: String, requiered: [true, 'El correo de facturación es necesario'] },
    credito: { type: String, requiered: [true, 'El credito es necesario'] },
    img: { type: String, required: false },
    empresas: [{
        type: Schema.Types.ObjectId,
        ref: 'Cliente'
    }],
    role: { type: String, required: true, default: 'CLIENT_ROLE', enum: rolesValidos },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'clientes' });

clienteSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Cliente', clienteSchema);