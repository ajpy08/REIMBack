var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var rolesValidos = {
  values: ['ADMIN_ROLE', 'PATIOADMIN_ROLE', 'REIM_ROLE', 'PATIO_ROLE', 'AA_ROLE', 'NAVIERA_ROLE', 'TRANSPORTISTA_ROLE', 'CLIENT_ROLE', 'REIMADMIN_ROLE'],
  message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
  nombre: { type: String, unique: [true, 'El correo ya se encuentra resitrado'], required: [true, 'El nombre es necesario'] },
  email: { type: String, unique: [true, 'El correo ya se encuentra resitrado'], required: [true, 'El correo es necesario'] },
  password: { type: String, required: [true, 'La contraseña es necesario'] },
  img: { type: String, required: false },
  role: { type: String, required: true, enum: rolesValidos },
  empresas: [{ type: Schema.Types.ObjectId, ref: 'Cliente' }],
  activo: { type: Boolean, default: true, required: [true, 'El campo es obligatorio'] },
  observaciones: { type: String },
  usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fAlta: { type: Date, default: Date.now },
  usuarioMod: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fMod: { type: Date },
  reset_password_token: { type: String },
  reset_password_expires: { type: Date }
}, { collection: 'usuarios' });

usuarioSchema.plugin(uniqueValidator, { message: 'Ya se encuentra registrado' })

module.exports = mongoose.model('Usuario', usuarioSchema);