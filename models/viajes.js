var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var vacioimportacionValidos = {
    values: ['Vacio', 'Importación'],
    message: '{VALUE} no esta permitido'
};

/* codigo antiguo
 contenedores: [{
        contenedor: { type: Schema.Types.ObjectId, unique: true, ref: 'Contenedor' },
        tipo: { type: String },
        peso: { type: String, default: 'Vacio', enum: vacioimportacionValidos },
        cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true }
    }],
*/

var viajeSchema = new Schema({
    anio: { type: Date, default: Date.now },
    viaje: { type: String, unique: true, required: [true, 'El viaje es necesario'] },
    buque: { type: Schema.Types.ObjectId, ref: 'Buque', required: true },
    fechaArribo: { type: Date, default: Date.now },
    fechaVigenciaTemporal: { type: Date, default: Date.now },
    contenedores: [{
        Contenedor: { type: String, unique: false, required: [true, 'El contenedor es necesario'] },
        Tipo: { type: String },
        Estado: { type: String },
        Cliente: { type: String, required: false }
    }],
    
    pdfTemporal: { type: String, required: false },
    usuarioAlta: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fechaAlta: { type: Date, default: Date.now },
}, { collection: 'viajes' });

viajeSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })

module.exports = mongoose.model('Viaje', viajeSchema);