var EasyFtp = require("easy-ftp");
var ftp = new EasyFtp();
var fs = require('fs');
var entorno = require('../config/config').config();

exports.UploadFile = function UploadFile(ruta, empresa, eliminarDespues) {

    return new Promise((resolve, reject) => {

        if (empresa == 'MSC') {
            ftp.connect(entorno.configFTP_MSC);
        }

        var nombreArchivo = ruta.replace(/^.*[\\\/]/, '');

        ftp.upload(ruta, "/" + nombreArchivo, function (err) {
            if (fs.existsSync(ruta)) {
                if (err) {
                    reject(err);
                } else {
                    if (eliminarDespues) {
                        fs.unlink(ruta, (err) => {
                            if (err) {
                                reject(err);
                                // return
                            } else {
                                resolve(ok = true);
                            }
                        })
                    }
                    resolve(ok = true);
                }
            }
        });
        //ftp.close();
    });
}

exports.DeleteFile = function DeleteFile(nombreArchivo, empresa) {
    return new Promise((resolve, reject) => {
        if (empresa == 'MSC') {
            ftp.connect(entorno.configFTP_MSC);
        }
        // console.log('FTP CONNECTED:' + ftp.client.isConnect)

        ftp.rm("\\" + nombreArchivo, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(ok = true);
            }
        });

        //ftp.close();
    });
}

exports.ExistFile = function ExistFile(nombreArchivo, empresa) {
     return new Promise((resolve, reject) => {
        if (!ftp.isConnect) {
            if (empresa == 'MSC') {
                ftp.connect(entorno.configFTP_MSC);
            }            
        }
        ftp.exist('/' + nombreArchivo, function (exist) {  
            if (exist) {
                //console.log('Si existe')
                resolve(ok = true);
            } else {
                //console.log('No existe')
                resolve(ok = false);
            }
        });
     });
}

exports.ListFiles = function ListFiles(empresa) {
    return new Promise((resolve, reject) => {
        if (empresa == 'MSC') {
            ftp.connect(entorno.configFTP_MSC);
        }

        ftp.ls("\\", function (err, list) {
            if (err) {
                reject(err);
            } else {
                resolve(list = list);
            }
        });
    });
}
