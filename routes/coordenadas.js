var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Coordenada = require('../models/coordenada');
var varias = require('../public/varias');

// ==========================================
// Obtener todas las coordenadas
// ==========================================
app.get('/', (req, res, next) => {
    var bahia = req.query.bahia || '';
    var tipo = req.query.tipo || '';
    var activo = req.query.activo || true;
    var conManiobra = req.query.conManiobra || false;

    var filtro = '{';
    if (bahia != 'undefined' && bahia != '')
        filtro += '\"bahia\":' + '\"' + bahia + '\",';
    if (tipo != 'undefined' && tipo != '')
        filtro += '\"tipo\":' + '\"' + tipo + '\",';
    if (activo != 'undefined' && activo != '')
        filtro += '\"activo\":' + activo + ',';
    if (conManiobra === 'true')
        filtro += '\"maniobras.0\"' + ': {\"$exists\"' + ': true},';

    if (filtro != '{')
        filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse(filtro);

    Coordenada.find(json)
        .populate('maniobras.maniobra', '_id contenedor tipo grado')
        // .populate('usuarioAlta', 'nombre email')
        .sort({ bahia: 1 })
        .exec((err, coordenadas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar coordenadas',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                coordenadas: coordenadas,
                total: coordenadas.length
            });
        });
});

// ==========================================
//  Obtener Coordenada por bahia y posicion
// ==========================================
app.get('/coordenada/bahia_posicion', (req, res) => {
    var bahia = req.query.bahia;
    var posicion = req.query.posicion;

    var filtro = '{';
    if (bahia != 'undefined' && bahia != '')
        filtro += '\"bahia\":' + '\"' + bahia + '\",';
    if (posicion != 'undefined' && posicion != '')
        filtro += '\"posicion\":' + '\"' + posicion + '\",';


    if (filtro != '{')
        filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse(filtro);


    Coordenada.find(json)
        //.populate('maniobras.maniobra', '_id contenedor tipo grado')
        .exec((err, coordenada) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar coordenada',
                    errors: err
                });
            }
            if (!coordenada) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La coordenada con la bahia ' + bahia + ' y posicion ' + posicion + ' no existe',
                    errors: { message: 'No existe un coordenada con esa bahia y posicion' }
                });
            }
            res.status(200).json({
                ok: true,
                coordenada: coordenada[0],
                // total: coordenada.length
            });
        });
});

// ==========================================
//  Obtener coordenadas Disponibles
// ==========================================
app.get('/disponibles', (req, res, next) => {
    var coord = [];
    // Coordenada.find({ maniobras: { $exists: false }, activo: true })
    Coordenada.find({ activo: true })
        .populate('maniobras.maniobra', '_id contenedor tipo grado')
        // .populate('usuarioAlta', 'nombre email')
        .sort({ bahia: 1, posicion: 1 })
        .exec((err, coordenadas) => {

            var coordenadasAgrupadas = varias.groupArray(coordenadas, 'bahia');

            //for a cada grupo 
            for (var g in coordenadasAgrupadas) {
                var letraAnterior = '';
                coordenadasAgrupadas[g].forEach(c => {
                    var letraPosicion = c.posicion.substring(0, 1);

                    if (letraAnterior != letraPosicion) {
                        coord.push({
                            bahia: c.bahia,
                            posicion: c.posicion,
                            tipo: c.tipo,
                            maniobras: c.maniobras.length > 0 ? c.maniobras : undefined
                        });
                        letraAnterior = letraPosicion;
                    }
                });
            }
            var coordenadasDisponibles = coord;
            coord.forEach(c => {
                if (c.maniobras) {
                    c.maniobras.forEach(m => {
                        var restante = c.tipo - parseInt(m.maniobra.tipo.substring(0, 2));
                        if (restante <= 0) {
                            var indice = coordenadasDisponibles.indexOf(c); // obtenemos el indice
                            coordenadasDisponibles.splice(indice, 1);
                        } else {
                            c.tipo = restante;
                        }
                    });
                }
            });

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar coordenadas',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                //coordenadas: coordenadasAgrupadas,
                coordenadas: varias.groupArray(coordenadasDisponibles, 'bahia'),
                total: coordenadas.length
            });
        });
});

// // =======================================
// // Actualizar Coordenada
// // =======================================

// app.put('coordenada/:id', mdAutenticacion.verificaToken, (req, res) => {
//     var id = req.params.id;
//     var body = req.body;
//     Coordenada.findById(id, (err, coordenada) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error al buscar la coordenada',
//                 errors: err
//             });
//         }
//         if (!coordenada) {
//             return res.status(400).json({
//                 ok: false,
//                 mensaje: 'La coordenada con el id ' + id + ' no existe',
//                 errors: { message: 'No existe una coordenada con ese ID' }
//             });
//         }
//         coordenada.bahia = body.bahia;
//         coordenada.posicion = body.posicion;
//         coordenada.tipo = body.tipo;
//         coordenada.activo = body.activo;
//         coordenada.maniobras = body.maniobras;
//         // coordenada.usuarioMod = req.usuario._id;
//         // coordenada.fMod = new Date();
//         coordenada.save((err, coordenadaGuardada) => {
//             if (err) {
//                 return res.status(400).json({
//                     ok: false,
//                     mensaje: 'Error al actualizar coordenada',
//                     errors: err
//                 });
//             }
//             res.status(200).json({
//                 ok: true,
//                 coordenada: coordenadaGuardada
//             });
//         });
//     });
// });

// // =======================================
// // Actualizar Coordenada (maniobra)
// // =======================================

app.put('/coordenada/:id/actualiza_maniobra', mdAutenticacion.verificaToken, (req, res) => {    
    var id = req.params.id;
    var body = req.body;
    Coordenada.findById(id, (err, coordenada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar la coordenada',
                errors: err
            });
        }
        if (!coordenada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La coordenada con el id ' + id + ' no existe',
                errors: { message: 'No existe una coordenada con ese ID' }
            });
        }
        coordenada.maniobras = body.maniobras;
        coordenada.save((err, coordenadaGuardada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar coordenada',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                coordenada: coordenadaGuardada
            });
        });
    });
});

// // =======================================
// // Actualizar Coordenada (solo activo)
// // =======================================

// app.put('coordenada/:id/actualiza_activo', mdAutenticacion.verificaToken, (req, res) => {
//     var id = req.params.id;
//     var body = req.body;
//     Coordenada.findById(id, (err, coordenada) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error al buscar la coordenada',
//                 errors: err
//             });
//         }
//         if (!coordenada) {
//             return res.status(400).json({
//                 ok: false,
//                 mensaje: 'La coordenada con el id ' + id + ' no existe',
//                 errors: { message: 'No existe una coordenada con ese ID' }
//             });
//         }
//         coordenada.activo = body.activo;
//         coordenada.save((err, coordenadaGuardada) => {
//             if (err) {
//                 return res.status(400).json({
//                     ok: false,
//                     mensaje: 'Error al actualizar coordenada',
//                     errors: err
//                 });
//             }
//             res.status(200).json({
//                 ok: true,
//                 coordenada: coordenadaGuardada
//             });
//         });
//     });
// });

// // =======================================
// // Actualizar Coordenada (solo maniobras)
// // =======================================

// app.put('coordenada/:id/actualiza_maniobras', mdAutenticacion.verificaToken, (req, res) => {
//     var id = req.params.id;
//     var body = req.body;
//     Coordenada.findById(id, (err, coordenada) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 mensaje: 'Error al buscar la coordenada',
//                 errors: err
//             });
//         }
//         if (!coordenada) {
//             return res.status(400).json({
//                 ok: false,
//                 mensaje: 'La coordenada con el id ' + id + ' no existe',
//                 errors: { message: 'No existe una coordenada con ese ID' }
//             });
//         }
//         coordenada.maniobras = body.maniobras;
//         coordenada.save((err, coordenadaGuardada) => {
//             if (err) {
//                 return res.status(400).json({
//                     ok: false,
//                     mensaje: 'Error al actualizar coordenada',
//                     errors: err
//                 });
//             }
//             res.status(200).json({
//                 ok: true,
//                 coordenada: coordenadaGuardada
//             });
//         });
//     });
// });

module.exports = app;