var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['TRANSPORTISTA_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var transportistaSchema = new Schema({
    rfc: { type: String, unique: true, required: [true, 'El RFC es necesario'] },
    razonSocial: { type: String, unique: true, requiered: [true, 'La razon social es necesario'] },
    nombreComercial: { type: String, requiered:false},
    calle: { type: String, requiered:false },
    noExterior: { type: String, required: false},
    noInterior: { type: String, required: false },
    colonia: { type: String, requiered: false },
    municipio: { type: String, requiered: false},
    ciudad: { type: String, requiered: false},
    estado: { type: String, requiered: [true, 'El estado es necesaria'] },
    cp: { type: String, requiered: [true, 'El codigo postal es necesaria'] },
    formatoR1: { type: String, required: false },
    correo: { type: String, requiered: [true, 'EL correo es necesaria'] },
    correoFac: { type: String, requiered: [true, 'El correo de facturación es necesaria'] },
    credito: { type: String, requiered: [true, 'EL credito es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'TRANSPORTISTA_ROLE', enum: rolesValidos },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fAlta: { type: Date, default: Date.now },
    usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fMod: { type: Date }
}, { collection: 'clientes' });

transportistaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Transportista', transportistaSchema);


