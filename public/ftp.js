var EasyFtp = require("easy-ftp");
var ftp = new EasyFtp();
var fs = require('fs');
var envJSON = require("../config/env.variables.json");


var configMSC = envJSON["development"]["configFTP_MSC"];

exports.UploadFile = function UploadFile(ruta, empresa, eliminarDespues) {
    if (empresa == 'MSC') {
        ftp.connect(configMSC);        
    }

    var nombreArchivo = ruta.replace(/^.*[\\\/]/, '');

    ftp.upload(ruta, "/Test_MYT/" + nombreArchivo, function (err) {
        if (fs.existsSync(ruta)) {
            if (err) {
                console.log(err)
            } else {
                if (eliminarDespues) {
                    fs.unlink(ruta, (err) => {
                        if (err) {
                            console.error(err)
                            // return
                        }
                    })
                }
            }
        }
    });
    //ftp.close();
}

exports.DeleteFile = function DeleteFile(nombreArchivo) {

    ftp.connect(config);
    // console.log('FTP CONNECTED:' + ftp.client.isConnect)

    ftp.rm("/Test_MYT/" + nombreArchivo, function (err) { });

    //ftp.close();
}
