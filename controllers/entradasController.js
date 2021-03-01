const Entrada = require('../models/entrada');
module.exports = {
    consultaEntradas: async (req, res) => {
        // Busco Entradas con material
        const noFactura = req.query.noFactura || '';
        const proveedor = req.query.proveedor || '';
        const material = req.query.material || '';
        const tipo = req.query.tipo || '';
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
            .populate('usuarioAlta', 'nombre email')
            .populate('usuarioMod', 'nombre email')
            .populate('proveedor', 'razonSocial')
            .populate('detalles.material', 'descripcion costo precio tipo minimo')
            .sort({ fAlta: -1 })
            .exec();
        return entradas;
    },
}