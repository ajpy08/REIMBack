var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['AA_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var agenciaSchema = new Schema({
    rfc: { type: String, unique: true, required: [true, 'El RFC es necesario'] },
    razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesario'] },
    nombreComercial: { type: String, requiered: false },
    calle: { type: String, requiered: false },
    noExterior: { type: String, required: false },
    noInterior: { type: String, required: false },
    colonia: { type: String, requiered: false },
    municipio: { type: String, requiered: false },
    ciudad: { type: String, requiered: false },
    estado: { type: String, requiered: [true, 'El estado es necesario'] },
    cp: { type: String, requiered: [true, 'El codigo postal es necesario'] },
    formatoR1: { type: String, required: false },
    correo: { type: String, requiered: false },
    correoFac: { type: String, requiered: false },
    credito: { type: Boolean, requiered: [true, 'EL credito es necesario'], default: false },
    img: { type: String, required: false },
    patente: { type: String, requiered: [true, 'La patente es necesaria'] },
    role: { type: String, required: true, default: 'AA_ROLE', enum: rolesValidos },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'clientes' });

agenciaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Agencia', agenciaSchema);