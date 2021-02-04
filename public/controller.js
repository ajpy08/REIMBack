const Entrada = require('../models/entrada');
const Merma = require('../models/merma');
const Mantenimiento = require('../models/mantenimiento');

module.exports = {
    consultaEntradas: async (req, res) => {
        // Busco Entradas con material
        const noFactura = req.query.noFactura || '';
        const proveedor = req.query.proveedor || '';
        const material = req.query.material || '';
        let filtro = '{';
        if (noFactura != 'undefined' && noFactura != '')
            filtro += '\"noFactura\":' + '\"' + noFactura + '\",';
        if (proveedor != 'undefined' && proveedor != '')
            filtro += '\"proveedor\":' + '\"' + proveedor + '\",';
        if (material != 'undefined' && material != '')
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
    },
    consultaMermas: async (req, res) => {
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
    },
    consultaMantenimientos: async (req, res) => {
        const material = req.params.material;

        const tipoMantenimiento = req.query.tipoMantenimiento || '';
        const maniobra = req.query.maniobra || '';
        const finalizado = req.query.finalizado || '';

        let filtro = '{';
        if (material != undefined && material != '') {
            filtro += '\"materiales.material\":' + '\"' + material + '\",';
        }

        if (tipoMantenimiento != 'undefined' && tipoMantenimiento != '')
            filtro += '\"tipoMantenimiento\":' + '\"' + tipoMantenimiento + '\",';
        if (maniobra != 'undefined' && maniobra != '')
            filtro += '\"maniobra\":' + '\"' + maniobra + '\",';
        if (finalizado != 'undefined' && finalizado != '')
            if (finalizado !== "TODOS")
                if (finalizado === "FINALIZADOS") filtro += '\"finalizado\":' + '\"true\",';
                else filtro += '\"finalizado\":' + '\"false\",';


        // if (reparacion === 'true') {
        //   filtro += '\"reparaciones.0\"' + ': {\"$exists\"' + ': true},';
        // }

        // if (finillegada != '' && ffinllegada) {
        //   fIni = moment(finillegada, 'DD-MM-YYYY', true).utc().startOf('day').format();
        //   fFin = moment(ffinllegada, 'DD-MM-YYYY', true).utc().endOf('day').format();
        //   filtro += '\"fLlegada\":{ \"$gte\":' + '\"' + fIni + '\"' + ', \"$lte\":' + '\"' + fFin + '\"' + '},';
        // }

        if (filtro != '{')
            filtro = filtro.slice(0, -1);
        filtro = filtro + '}';
        const json = JSON.parse(filtro);


        // Busco Material en Mantenimientos

        const mantenimientos = Mantenimiento.find(json)
            // .populate('materiales.material', 'descripcion')
            .populate('usuario', 'nombre email')
            .populate('maniobra', 'contenedor tipo peso')
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

}