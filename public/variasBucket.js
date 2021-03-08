var AWS = require('aws-sdk');
var entorno = require('../config/config').config();

exports.ListaArchivosBucket = (ruta) => {
    return new Promise((resolve, reject) => {
        var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
        var params = {
            Bucket: entorno.BUCKET,
            Delimiter: '/',
            Prefix: ruta
        };

        s3.listObjects(params, (err, data) => {
            if (err) throw err;
            resolve(data.Contents);
        });
    });
};

exports.SubirArchivoBucket = function SubirArchivoBucket(archivo, rutaDestino, nombreArchivo) {
    return new Promise((resolve, reject) => {
        var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
        if (archivo.data === undefined) {
            var params = {
                Bucket: entorno.BUCKET,
                Body: archivo,
                Key: rutaDestino + nombreArchivo,
                ContentType: archivo.mimetype
            };
        } else {
            params = {
                Bucket: entorno.BUCKET,
                Body: archivo.data,
                Key: rutaDestino + nombreArchivo,
                ContentType: archivo.mimetype
            };
        }
        s3.upload(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                console.log("Uploaded in:", data.Location);
                resolve(true);
            }
        });
    });
};

exports.CopiarArchivoBucket = (rutaTmp, nameTmp, rutaDestino) => {
    if (nameTmp != null && nameTmp != undefined && nameTmp != '') {
        var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
        var params = {
            Bucket: entorno.BUCKET,
            CopySource: entorno.BUCKET + '/' + rutaTmp + nameTmp,
            Key: rutaDestino + nameTmp
        };
        s3.copyObject(params, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                //Si se mueve, borro el original
                var paramsDelete = {
                    Bucket: entorno.BUCKET,
                    Key: rutaTmp + nameTmp
                };
                // s3.deleteObject(paramsDelete, function (err, data) {
                //   if (err) {
                //     console.log("Error", err);
                //   }
                //   if (data) {
                //     console.log("Elemento eliminado:", rutaTmp + nameTmp);
                //   }
                // });
            }
        });
    }
    return (true);
};

exports.MoverArchivoBucket = function MoverArchivoBucket(rutaTmp, nameTmp, rutaDestino) {
    if (nameTmp != null && nameTmp != undefined && nameTmp != '') {
        var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
        var params = {
            Bucket: entorno.BUCKET,
            CopySource: entorno.BUCKET + '/' + rutaTmp + nameTmp,
            Key: rutaDestino + nameTmp
        };
        s3.copyObject(params, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                console.log('Archivo movido ' + rutaDestino + nameTmp);
                //Si se mueve, borro el original
                var paramsDelete = {
                    Bucket: entorno.BUCKET,
                    Key: rutaTmp + nameTmp
                };
                s3.deleteObject(paramsDelete, function(err, data) {
                    if (err) {
                        console.log("Error", err);
                    }
                    if (data) {
                        console.log("Elemento eliminado:", rutaTmp + nameTmp);
                    }
                });
            }
        });
    }
    return (true);
};

exports.BorrarArchivoBucket = function BorrarArchivoBucket(ruta, name) {
    if (name != null && name != undefined && name != '') {
        var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
        var paramsDelete = {
            Bucket: entorno.BUCKET,
            Key: ruta + name
        };
        s3.deleteObject(paramsDelete, function(err, data) {
            if (err) {
                console.log("Error", err);
            }
            if (data) {
                console.log("Elemento eliminado:", ruta + name);
            }
        });
    }
};






exports.BorrarArchivoBucketKey = function BorrarArchivoBucketKey(key) {
    return new Promise((resolve, reject) => {
        if (key != null && key != undefined && key != '') {
            var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
            var paramsDelete = {
                Bucket: entorno.BUCKET,
                Key: key
            };
            console.log(paramsDelete);
            s3.deleteObject(paramsDelete, function(err, data) {
                if (err) {
                    console.log("Error", err);
                }
                if (data) {
                    console.log("Elemento eliminado:", key);
                    resolve(true);
                }
            });
        }
    });
};


exports.BorrarCarpetaBucket = function BorrarCarpetaBucket(key) {
        return new Promise((resolve, reject) => {
                if (key != null && key != undefined && key != '') {
                    var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
                    var folderDelete = {
                        Bucket: entorno.BUCKET,
                        prefix: key
                    };




                    s3.deleteObjects(folderDelete,
                        do |obj |
                            s3.delete_object({ bucket: entorno.BUCKET, key: obj.key })
                        end
                    }
                });
        };