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
        .populate('maniobras.maniobra', '_id contenedor tipo grado')
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
app.get('/disponibles/:maniobra?', (req, res, next) => {
    var maniobra = req.query.maniobra || '';
    var activo = true;

    var filtro = '{';
    // if (maniobra != 'undefined' && maniobra != '')
    //     filtro += '\"maniobra\":' + '\"' + maniobra + '\",';
    if (activo != 'undefined' && activo != '')
        filtro += '\"activo\":' + '\"' + activo + '\",';

    if (filtro != '{')
        filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    var json = JSON.parse(filtro);

    Coordenada.find(json)
        .populate('maniobras.maniobra', '_id contenedor tipo grado')
        // .populate('usuarioAlta', 'nombre email')
        .sort({ bahia: 1, posicion: 1 })
        .exec((err, coordenadas) => {

            ///////////////////////////////////////////////////////////////////////////////////////
            //Saco las coordenadas que tienen maniobras (Que estan total o parcialmente ocupadas)//
            ///////////////////////////////////////////////////////////////////////////////////////

            var coordenadasOcupadas = [];
            var coordenadasTemp = [];

            coordenadas.forEach(c => {
                coordenadasTemp.push(c)
                if (c.maniobras && c.maniobras.length > 0) {
                    c.maniobras.forEach(m => {
                        var restante = c.tipo - parseInt(m.maniobra.tipo.substring(0, 2));
                        if (restante <= 0) {
                            coordenadasOcupadas.push(c);
                            var indice = coordenadasTemp.indexOf(c); // obtenemos el indice
                            coordenadasTemp.splice(indice, 1);
                        } else {
                            if (c.tipo != restante) {
                                coordenadasOcupadas.push(c);
                            }
                            c.tipo = restante;
                        }
                    });
                }
            });

            ///////////////////////////////////////////////////////////////////////////////////////
            //De las coordenadas resultantes obtengo su posicion anterior para obtener su tamaño //
            //y las maniobras que contiene, hago una suma de los tamaños de las maniobras y veo  //
            //si esta total o parcialmente ocupado, dependiendo de eso asigno el tamaño de la    //
            //posicion de arriba, tambien si tiene ocupada la posicion del nivel anterior pongo  //
            //como disponible la posicion pero con el tamaño de abajo                            //
            ///////////////////////////////////////////////////////////////////////////////////////

            var coordenadasDisponibles = [];

            coordenadasTemp.forEach(c => {

                var letraPosicion = c.posicion.substring(0, 1);
                var nivelPosicion = c.posicion.substring(1, c.posicion.length)
                var coordenadaAnt = new Coordenada({
                    bahia: c.bahia,
                    posicion: letraPosicion + (parseInt(nivelPosicion) - 1)
                });
                var coordenadaNivelInferior = coordenadasOcupadas.filter(cor => cor.bahia == coordenadaAnt.bahia &&
                    cor.posicion == coordenadaAnt.posicion)[0];

                var tipoNivelAnterior = 0;
                var insertar = true;
                var soyYO = false;
                if (nivelPosicion > 1) {
                    if (coordenadaNivelInferior && coordenadaNivelInferior.maniobras) {
                        coordenadaNivelInferior.maniobras.forEach(m => {
                            if (m.maniobra.id == maniobra) {
                                soyYO = true;
                            }
                            tipoNivelAnterior += parseInt(m.maniobra.tipo.substring(0, 2));
                        });
                        if (soyYO) {
                            insertar = !soyYO;
                        } else {
                            if (tipoNivelAnterior < c.tipo) {
                                insertar = true;      
                            } else {
                                insertar = false;                                
                            }
                        }
                    } else {
                        insertar = false;
                    }
                }

                ///////////////////////////////////////////////////////////////////////////////////////
                //Inserto las coordenadas disponibles despues de todas las validaciones.             //
                ///////////////////////////////////////////////////////////////////////////////////////

                if (insertar) {
                    coordenadasDisponibles.push({
                        bahia: c.bahia,
                        posicion: c.posicion,
                        tipo: tipoNivelAnterior > 0 ? tipoNivelAnterior : c.tipo,
                        maniobras: c.maniobras ? c.maniobras : undefined
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
                coordenadas: varias.groupArray(coordenadasDisponibles, 'bahia'),
                total: coordenadasDisponibles.length
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