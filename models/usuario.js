var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'PATIOADMIN_ROLE', 'PATIO_ROLE', 'AA_ROLE', 'NAVIERA_ROLE', 'TRANSPORTISTA_ROLE', 'CLIENT_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesario'] },
    img: { type: String, required: false },
    role: { type: String, required: true, enum: rolesValidos },
    empresas: [{
        type: Schema.Types.ObjectId,
        ref: 'Cliente'
    }],
    reset_password_token: { type: String },
    reset_password_expires: { type: Date }
}, { collection: 'usuarios' });

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Usuario', usuarioSchema);