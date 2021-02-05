const Merma = require('../models/merma');

module.exports = {
    consultaMermas: (req, res) => {
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

        return Merma.find(jsonMermas)
            .populate('usuarioAprobacion', 'nombre email')
            .populate('usuarioAlta', 'nombre email')
            .populate('usuarioMod', 'nombre email')
            .populate('materiales.material', 'descripcion')
            .exec();
    },
    consultaMermaById: (req, res) => {
        const id = req.params.id;
        return Merma.findById(id)
            .populate('materiales.material', 'descripcion')
            .exec();
    },
}