// requires
const express = require('express');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const mdAutenticacion = require('../middlewares/autenticacion');
// const fs = require('fs');

// Inicializar variables
const app = express();

// console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]));

// default options
app.use(fileUpload());

app.put('/', (req, res) => {

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar un archivo excel' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.xlsx;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    var extensionesValidas = ['xlsx', 'xls'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }
    const workbook = XLSX.read(archivo.data, { type: 'buffer' });
    const sheet_name_list = workbook.SheetNames;
    res.status(200).json({
        ok: true,
        excel: XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    });
    // console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]));


});

module.exports = app;