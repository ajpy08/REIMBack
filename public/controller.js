var Entrada = require('../models/entrada');
var Merma = require('../models/merma');
var Mantenimiento = require('../models/mantenimiento');

exports.consultaEntradas = async (req, res) => {

    const material = req.params.material;

    let filtro = '{';
    if (material != undefined && material != '')
        filtro += '\"detalles.material\":' + '\"' + material + '\",';

    if (filtro != '{')
        filtro = filtro.slice(0, -1);
    filtro = filtro + '}';
    const json = JSON.parse(filtro);

    // Busco Material en Entradas
    const entradas = await Entrada.find(json)
        .populate('detalles.material', 'descripcion costo precio tipo minimo')
        .sort({ fAlta: -1 })
        .exec(
            // (err, entradas) => {
            //     if (err) {
            //         return res.status(500).json({
            //             ok: false,
            //             mensaje: 'Error cargando entradas',
            //             errors: err
            //         });
            //     }
            //     res.status(200).json({
            //         ok: true,
            //         entradas: entradas,
            //         totalRegistros: entradas.length
            //     });
            // }
        );
    return entradas;
}

exports.consultaMermas = async (req, res) => {
    const material = req.params.material;
    // Busco Material en Mermas
    let filtroMermas = '{';
    if (material != undefined && material != '') {
        filtroMermas += '\"materiales.material\":' + '\"' + material + '\",';
        filtroMermas += '\"fAprobacion\":{\"$exists\":' + '\"' + true + '\"}' + '}';
    }

    if (filtroMermas != '{')
        filtroMermas = filtroMermas.slice(0, -1);
    filtroMermas = filtroMermas + '}';
    const jsonMermas = JSON.parse(filtroMermas);

    const mermas = await Merma.find(jsonMermas)
        // .populate('materiales.material', 'descripcion')
        .exec(
            // (err, mermas) => {
            //     if (err) {
            //         return res.status(500).json({
            //             ok: false,
            //             mensaje: 'Error al buscar mermas',
            //             errors: err
            //         });
            //     }
            //     if (!mermas) {
            //         return res.status(400).json({
            //             ok: false,
            //             mensaje: 'El material con el id ' + material + ' no existe',
            //             errors: { message: 'No existe un material con ese ID' }
            //         });
            //     }
            // }
        );
    return mermas;
}

exports.consultaMantenimientos = async (req, res) => {
    const material = req.params.material;
    // Busco Material en Mantenimientos
    let filtroMantenimientos = '{';
    if (material != undefined && material != '') {
        filtroMantenimientos += '\"materiales.material\":' + '\"' + material + '\",';
    }

    if (filtroMantenimientos != '{')
        filtroMantenimientos = filtroMantenimientos.slice(0, -1);
    filtroMantenimientos = filtroMantenimientos + '}';
    const jsonMantenimientos = JSON.parse(filtroMantenimientos);


    const mantenimientos = Mantenimiento.find(jsonMantenimientos)
        // .populate('materiales.material', 'descripcion')
        .exec(
            // (err, mantenimientos) => {
            //     if (err) {
            //         return res.status(500).json({
            //             ok: false,
            //             mensaje: 'Error al buscar mantenimientos',
            //             errors: err
            //         });
            //     }
            //     if (!mantenimientos) {
            //         return res.status(400).json({
            //             ok: false,
            //             mensaje: 'El material con el id ' + material + ' no existe',
            //             errors: { message: 'No existe un material con ese ID' }
            //         });
            //     }
            // }
        );
    return mantenimientos;
}