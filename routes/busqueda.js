var express = require('express');

var app = express();

var Usuario = require('../models/usuario');
var Camion = require('../models/camion');
var Operador = require('../models/operador');
var Cliente = require('../models/cliente');
var Maniobra = require('../models/maniobra');
var Transportista = require('../models/transportista');
var Agencia = require('../models/agencia');
var Buque = require('../models/buque');
var Reparacion = require('../models/reparacion');

// ==============================
// Busqueda por colección
// ==============================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');
    // console.log('busqueda: ' + busqueda + ' en tabla: ' + tabla + ' Y regex : ' + regex)
    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'operadores':
            promesa = buscarOperadores(busqueda, regex);
            break;
        case 'camiones':
            promesa = buscarCamiones(busqueda, regex);
            break;
        case 'contenedores':
            promesa = buscarContenedores(busqueda, regex);
            break;
        case 'clientes':
            promesa = buscarClientes(busqueda, regex);
            break;
        case 'agencias':
            promesa = buscarAgencias(busqueda, regex);
            break;
        case 'transportistas':
            promesa = buscarTransportistas(busqueda, regex);
            break;
        case 'maniobras':
            promesa = buscarManiobras(busqueda, regex);
            break;
        case 'maniobrasTransito':
            promesa = buscarManiobrasTransito(busqueda, regex);
            break;
        case 'buques':
            promesa = buscarBuques(busqueda, regex);
            break;
        case 'reparaciones':
            promesa = buscarReparaciones(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, operadores, camiones, contenedores, clientes, maniobras, transportistas, agencias y buques',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

// ==============================
// Busqueda general
// ==============================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    Promise.all([
        buscarOperadores(busqueda, regex),
        buscarCamiones(busqueda, regex),
        buscarContenedores(busqueda, regex),
        buscarClientes(busqueda, regex),
        buscarAgencias(busqueda, regex),
        buscarTransportistas(busqueda, regex),
        buscarManiobras(busqueda, regex),
        buscarUsuarios(busqueda, regex),
        buscarBuques(busqueda, regex),
        buscarReparaciones(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            operadores: respuestas[0],
            camiones: respuestas[1],
            contenedores: respuestas[2],
            clientes: respuestas[3],
            agencias: respuestas[4],
            transportistas: respuestas[5],
            maniobras: respuestas[6],
            usuarios: respuestas[7],
            buques: respuestas[8]
        });
    });
});

function buscarOperadores(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Operador.find({ operador: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, operador) => {
                if (err) {
                    reject('Error al cargar operadores', err);
                } else {
                    resolve(operador);
                }
            });
    });
}

function buscarCamiones(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Camion.find({ camion: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, camiones) => {
                if (err) {
                    reject('Error al cargar camiones', err);
                } else {
                    resolve(camiones);
                }
            });
    });
}

function buscarContenedores(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Contenedor.find({ contenedor: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, contenedor) => {
                if (err) {
                    reject('Error al cargar contenedores', err);
                } else {
                    resolve(contenedor);
                }
            });
    });
}

function buscarClientes(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Cliente.find({ cliente: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, clientes) => {
                if (err) {
                    reject('Error al cargar clientes', err);
                } else {
                    resolve(clientes);
                }
            });
    });
}

function buscarAgencias(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Agencia.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, agencias) => {
                if (err) {
                    reject('Error al cargar agencias', err);
                } else {
                    resolve(agencias);
                }
            });
    });
}

function buscarTransportistas(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Transportista.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, transportistas) => {
                if (err) {
                    reject('Error al cargar transportistas', err);
                } else {
                    resolve(transportistas);
                }
            });
    });
}

function buscarManiobras(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Maniobra.find({ maniobra: regex })
            .populate('operador', 'operador')
            .populate('placas', 'placas')
            .populate('contenedor', 'contenedor')
            .populate('cliente', 'cliente')
            .populate('usuario', 'nombre email')
            .exec((err, maniobra) => {
                if (err) {
                    reject('Error al cargar maniobras', err);
                } else {
                    resolve(maniobra);
                }
            });
    });
}
function buscarManiobrasTransito(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Maniobra.find({ maniobra: regex })
            .populate('cliente', 'rfc razonSocial')
            .populate('agencia', 'rfc razonSocial')
            .populate('transportista', 'rfc razonSocial nombreComercial')
            .exec((err, maniobra) => {
                if (err) {
                    reject('Error al cargar maniobras', err);
                } else {
                    resolve(maniobra);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Erro al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

function buscarBuques(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Buque.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, buque) => {
                if (err) {
                    reject('Error al cargar operadores', err);
                } else {
                    resolve(buque);
                }
            });
    });
}

function buscarReparaciones(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Reparacion.find({ descripcion: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, reparacion) => {
                if (err) {
                    reject('Error al cargar operadores', err);
                } else {
                    resolve(reparacion);
                }
            });
    });
}

module.exports = app;