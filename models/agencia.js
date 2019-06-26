var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['AA_ROLE'],
    message: '{VALUE} no es un rol permitido'
};


var aaSchema = new Schema({
    razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesario'] },
    nombreComercial: { type: String, requiered: [true, 'EL nombre comercial es necesaria'] },
    rfc: { type: String, unique: true, required: [true, 'El RFC es necesario'] },
    calle: { type: String, requiered: [true, 'La calle es necesaria'] },
    noExterior: { type: String, required: [true, 'El numero exterior es necesario'] },
    noInterior: { type: String, required: false },
    colonia: { type: String, requiered: [true, 'La colonia es necesaria'] },
    municipio: { type: String, requiered: [true, 'El Municio/Delegación es necesaria'] },
    ciudad: { type: String, requiered: [true, 'La ciudad es necesaria'] },
    estado: { type: String, requiered: [true, 'El estado es necesaria'] },
    cp: { type: String, requiered: [true, 'El codigo postal es necesaria'] },
    formatoR1: { type: String, required: false },
    correo: { type: String, requiered: [true, 'EL correo es necesaria'] },
    correoFac: { type: String, requiered: [true, 'El correo de facturación es necesaria'] },
    credito: { type: String, requiered: [true, 'EL credito es necesaria'] },
    role: { type: String, required: true, default: 'AA_ROLE', enum: rolesValidos },
    img: { type: String, required: false },
    patente: { type: String, requiered: [true, 'La patente es necesaria'] },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }

    
}, { collection: 'clientes' });

aaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Agencia', aaSchema);