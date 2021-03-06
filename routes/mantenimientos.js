// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var mongoose = require('mongoose');
var app = express();
var Mantenimiento = require('../models/mantenimiento');
var Maniobra = require('../models/maniobra');
var variasBucket = require('../public/variasBucket');

const mantenimientosController = require('../controllers/mantenimientosController');
const materialesController = require('../controllers/materialesController');
const mermasController = require('../controllers/mermasController');
const entradasController = require('../controllers/entradasController');
const maniobrasController = require('../controllers/maniobrasController');

var entorno = require('../config/config').config();
var AWS = require('aws-sdk/global');
var fileUpload = require('express-fileupload');
var uuid = require('uuid/v1');
var s3Zip = require('s3-zip');


app.use(fileUpload());

// =======================================
// Obtener todos los Mantenimientos
// =======================================

app.get('', mdAutenticacion.verificaToken, (req, res) => {
	const mantenimientos = mantenimientosController.getMantenimientos(req, res);
	mantenimientos.then(mantenimientos => {
		res.status(200).json({
			ok: true,
			mantenimientos,
			totalRegistros: mantenimientos.length
		});
	}).catch(error => {
		console.log(error);
		return res.status(500).json({
			ok: false,
			mensaje: 'Error cargando mantenimientos',
			errors: error
		});
	});
});


// =======================================
// Obtener unico Mantenimiento por ID
// =======================================
app.get('/mantenimiento/:id', mdAutenticacion.verificaToken, (req, res) => {
	const mantenimiento = mantenimientosController.getMantenimiento(req, res);
	mantenimiento.then(mantenimiento => {
		if (mantenimiento) {
			return res.status(200).json({
				ok: true,
				mantenimiento
			});
		} else {
			return res.status(400).json({
				ok: false,
				mensaje: `El mantenimiento id ${req.params.id} no existe`,
				errors: { message: 'No existe un Mantenimiento con ese ID' }
			});
		}
	}).catch(error => {
		return res.status(500).json({
			ok: false,
			mensaje: 'Error al cargar el mantenimiento',
			errors: error
		});
	});
});

// =======================================
// Obtener mantenimientos con Material
// =======================================
app.get('/:idMaterial/con-material', mdAutenticacion.verificaToken, (req, res) => {
	const mantenimientos = mantenimientosController.getMantenimientosConMaterial(req, res);
	mantenimientos.then(mantenimientos => {
		res.status(200).json({
			ok: true,
			mantenimientos,
			totalRegistros: mantenimientos.length
		});
	}).catch(error => {
		console.log(error);
		return res.status(500).json({
			ok: false,
			mensaje: 'Error cargando mantenimientos',
			errors: error

		});
	});
});

// // =======================================
// // Obtener mantenimientos con filtros de maniobra
// // =======================================
// app.get('/maniobra/vacios', mdAutenticacion.verificaToken, (req, res) => {
// 	const mantenimientos = mantenimientosController.getMantenimientosManiobra(req, res);
// 	mantenimientos.then(mantenimientos => {
// 		res.status(200).json({
// 			ok: true,
// 			mantenimientos,
// 			totalRegistros: mantenimientos.length
// 		});
// 	}).catch(error => {
// 		console.log(error);
// 		return res.status(500).json({
// 			ok: false,
// 			mensaje: 'Error cargando mantenimientos',
// 			errors: error

// 		});
// 	});
// });

// =======================================
// Obtener lista de mantenimientos
// =======================================

app.get('', mdAutenticacion.verificaToken, (req, res) => {
	const mantenimientos = mantenimientosController.getMantenimientos(req, res);
	mantenimientos.then(mantenimientos => {
		return res.status(200).json({
			ok: true,
			mantenimientos,
			totalRegistros: mantenimientos.length
		});
	}).catch(error => {
		return res.status(500).json({
			ok: false,
			mensaje: 'Error cargando mantenimientos',
			errors: error
		});
	});
});


// ==========================================
// Agregar mantenimiento a la maniobra
// ==========================================

app.post('/mantenimiento', mdAutenticacion.verificaToken, (req, res) => {
	const newMant = mantenimientosController.insertMantenimiento(req, res);
	newMant.then(mantenimiento => {
		if (mantenimiento) {
			Maniobra.findById(mantenimiento.maniobra, (err, maniobra) => {
				if (err) {
					return res.status(500).json({
						ok: false,
						mensaje: 'Error al buscar maniobra',
						errors: err
					});
				}
				if (!maniobra) {
					return res.status(400).json({
						ok: false,
						mensaje: 'La maniobra con el id ' + id + ' no existe',
						errors: { message: 'No existe una maniobra con ese ID' }
					});
				}
				if (maniobra.status !== "LAVADO_REPARACION") {
					maniobra.estatus = "LAVADO_REPARACION";
					maniobra.save((err, maniobraGuardado) => {
						if (err) {
							return res.status(400).json({
								ok: false,
								mensaje: 'Error al actualizar la maniobra',
								errors: err
							});
						}
					});
				}
				return res.status(200).json({
					ok: true,
					mantenimiento,
					mensaje: 'Merma creada con éxito.',
				});
			});
		}
	}).catch(error => {
		return res.status(400).json({
			ok: false,
			mensaje: 'Error al crear el mantenimiento',
			errors: error
		});
	});
});


// ==========================================
// Editar mantenimientos de la maniobra
// ==========================================
app.put('/mantenimiento/:id', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body.mantenimiento;
	Mantenimiento.findById(id, (err, mantenimiento) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar el mantenimiento',
				errors: err
			});
		}
		if (!mantenimiento) {
			return res.status(400).json({
				ok: false,
				mensaje: 'El mantenimiento con el id ' + id + ' no existe',
				errors: { message: 'No existe mantenimiento con ese ID' }
			});
		}
		if (mantenimiento.finalizado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'El mantenimiento esta FINALIZADO, por lo tanto no se permite modificar',
				errors: { message: 'El mantenimiento esta FINALIZADO, por lo tanto no se permite modificar' }
			});
		}
		mantenimiento.folio = body.folio;
		mantenimiento.tipoMantenimiento = body.tipoMantenimiento;
		mantenimiento.tipoLavado = body.tipoMantenimiento === "LAVADO" ? body.tipoLavado : undefined;
		mantenimiento.cambioGrado = body.tipoMantenimiento === "ACONDICIONAMIENTO" ? body.cambioGrado : undefined;
		mantenimiento.observacionesGenerales = body.observacionesGenerales;
		mantenimiento.izquierdo = body.izquierdo;
		mantenimiento.derecho = body.derecho;
		mantenimiento.frente = body.frente;
		mantenimiento.puerta = body.puerta;
		mantenimiento.piso = body.piso;
		mantenimiento.techo = body.techo;
		mantenimiento.interior = body.interior;
		mantenimiento.fechas = body.fechas;
		mantenimiento.usuarioMod = req.usuario._id;
		mantenimiento.fMod = new Date();
		mantenimiento.save((err, mantenimientoGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar el mantenimiento',
					errors: err
				});
			}
			res.status(200).json({
				ok: true,
				mantenimiento: mantenimientoGuardado
			});
		});
	});

});

// ==========================================
// Finalizar mantenimiento
// ==========================================

app.put('/mantenimiento/:id/finaliza', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;
	Mantenimiento.findById(id, (err, mant) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar el Mantenimiento',
				errors: err
			});
		}
		if (!mant) {
			return res.status(400).json({
				ok: false,
				mensaje: 'El Mantenimientos con el id ' + id + ' no existe',
				errors: { message: 'No existe un Mantenimiento con ese ID' }
			});
		}

		// si voy a finalizar debo determinar si hay algun otro mantenimiento abierto, para saber si el estado de la maniobra lo mando a disponible
		Mantenimiento.find({
			maniobra: mant.maniobra,
			_id: { $ne: mant._id }
		}).exec((err, mantenimientos) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'No se pudo determinar si hay algun Mantinimiento Pendiente de Finalizar',
					errors: err
				});
			}

			if (body.finalizado === true && mant.fechas.length === 0) {
				return res.status(400).json({
					ok: false,
					mensaje: 'No se permite Finalizar, debe asignar fechas y horarios.',
					errors: err
				});
			}

			let FechasCorrectas = true;
			mant.fechas.forEach(f => {
				if (body.finalizado && (!f.fIni || f.hIni === '' || !f.fFin || f.hFin === '')) FechasCorrectas = false;
			});
			if (FechasCorrectas !== true) {
				return res.status(400).json({
					ok: false,
					mensaje: 'No se permite Finalizar, las fechas y horarios no se han asignado completamente.',
					errors: err
				});
			}

			if (!mant.materiales || mant.materiales.length == 0) {
				return res.status(400).json({
					ok: false,
					mensaje: 'No se permite Finalizar, Aún no se han cargado materiales.',
					errors: err
				});

			}


			mant.finalizado = body.finalizado;
			if (mant.finalizado) mant.fFinalizado = new Date();
			else mant.fFinalizado = undefined;

			mant.save((err, mantGuardado) => {
				if (err) {
					return res.status(400).json({
						ok: false,
						mensaje: 'Error intentar cambiar el estado de Finalizado del Mantenimiento',
						errors: err
					});
				}
				Maniobra.findById(mant.maniobra, (err, maniobra) => {

					if (err) {
						return res.status(500).json({
							ok: false,
							mensaje: 'Error al buscar la maniobra asociada',
							errors: err
						});
					}
					if (!maniobra) {
						return res.status(400).json({
							ok: false,
							mensaje: 'La maniobra asociada con el id ' + id + ' no existe',
							errors: { message: 'No existe una maniobra asociada con ese ID' }
						});
					}
					let losdemasFinalizados = true;
					mantenimientos.forEach(m => {
						losdemasFinalizados = m.finalizado && losdemasFinalizados;
					});
					if (mant.finalizado === true && losdemasFinalizados === true) maniobra.estatus = "DISPONIBLE";
					else maniobra.estatus = "LAVADO_REPARACION";
					maniobra.save((err, maniobraGuardado) => {
						if (err) {
							return res.status(400).json({
								ok: false,
								mensaje: 'Error al actualizar la maniobra',
								errors: err
							});
						}
						if (maniobraGuardado) {
							return res.status(200).json({
								ok: true,
								mensaje: 'El estatus Finalizado ha sido actualizado con éxito y el contenedor queda con el estatus :' + maniobraGuardado.estatus,
								errors: { message: 'El estatus Finalizado ha sido actualizado con éxito y el contenedor queda con el estatus: ' + maniobraGuardado.estatus }
							});
						}

					});
				});
			});
		});
	});
});

//Agregar Material al Mantenimiento
app.put('/mantenimiento/:id/addMaterial/:idMaterial', mdAutenticacion.verificaToken, async (req, res) => {
	let stock = 0;
	const material = await materialesController.getMaterialById(req, res);
	if (material && material.tipo === "M")
		stock = 1000;
	if (stock === 0) {
		const entradas = await entradasController.consultaEntradas(req, res);
		entradas.forEach(e => {
			e.detalles.forEach(d => {
				if (d.material._id == req.params.idMaterial) {
					ok = true;
					stock += d.cantidad;
				}
			});
		});
		const mermas = await mermasController.consultaMermas(req, res);
		mermas.forEach(e => {
			e.materiales.forEach(m => {
				if (m.material._id == req.params.idMaterial) {
					ok = true;
					stock -= m.cantidad;
				}
			});
		});
		const mantenimientos = await mantenimientosController.getMantenimientos(req, res);
		mantenimientos.forEach(e => {
			e.materiales.forEach(m => {
				if (m.material._id == req.params.idMaterial) {
					ok = true;
					stock -= m.cantidad;
				}
			});
		});
	}
	var id = req.params.id;
	var body = req.body.material;
	if (body.cantidad > stock) {
		return res.status(400).json({
			ok: false,
			mensaje: 'No se cuenta con suficiente stock para este material',
			errors: { message: 'No se cuenta con suficiente stock para este material' }
		});
	} else {
		Mantenimiento.findOneAndUpdate({ _id: id }, {
			$push: {
				materiales: {
					material: body.material,
					descripcion: body.descripcion,
					cantidad: body.cantidad,
					costo: body.costo,
					precio: body.precio,
					unidadMedida: body.unidadMedida,
					usuarioAlta: req.usuario._id
				}
			}
		}, (err, mantenimiento) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error al buscar el mantenimiento',
					errors: err
				});
			}
			if (!mantenimiento) {
				return res.status(400).json({
					ok: false,
					mensaje: 'El mantenimiento con el id ' + id + ' no existe',
					errors: { message: 'No existe mantenimiento con ese ID' }
				});
			}
			res.status(200).json({
				ok: true,
				mensaje: 'Material agregado con éxito',
				materiales: mantenimiento.materiales
			});

		});
	}
});

app.put('/mantenimiento/:id/editMaterial/:idMateria', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body.material;

	Mantenimiento.findOneAndUpdate({
		_id: id,
		'materiales._id': mongoose.Types.ObjectId(body._id)
	}, {
		$set: {
			'materiales.$': {
				material: body.material,
				descripcion: body.descripcion,
				cantidad: body.cantidad,
				costo: body.costo,
				precio: body.precio,
				unidadMedida: body.unidadMedida,
				usuarioMod: req.usuario._id,
				fMod: new Date()
			}
		}
	}, (err, mantenimiento) => {
		console.log(err);
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar el mantenimiento',
				errors: err
			});
		}
		if (!mantenimiento) {
			return res.status(400).json({
				ok: false,
				mensaje: 'El mantenimiento con el id ' + id + ' no existe',
				errors: { message: 'No existe el mantenimiento con ese ID' }
			});
		}
		res.status(200).json({
			ok: true,
			mensaje: 'Material Editado con éxito',
			eventos: mantenimiento.materiales
		});

	});
});

//Lista de materiales del Mantenimientos

app.get('/mantenimiento/:idMantenimiento/materiales', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.idMantenimiento;
	Mantenimiento.findById({ _id: id }, { materiales: 1 })
		.exec((err, mantenimiento) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error al consultar el Mantenimiento',
					errors: err
				});
			}
			res.status(200).json({
				ok: true,
				materiales: mantenimiento.materiales,
				total: mantenimiento.materiales ? mantenimiento.materiales.length : 0
			});
		});
});

// ==========================================
// Remover material del mantenimiento
// ==========================================

app.delete('/mantenimiento/:id/removeMaterial/:idMaterial', mdAutenticacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var idmaterial = req.params.idMaterial;
	Mantenimiento.findOneAndUpdate({ _id: id }, { $pull: { materiales: { _id: idmaterial } } }, (err, mantenimiento) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar el Material',
				errors: err
			});
		}
		if (!mantenimiento) {
			return res.status(400).json({
				ok: false,
				mensaje: 'El Mantenimiento con el id ' + id + ' no existe',
				errors: { message: 'No existe un Mantenimiento con ese ID' }
			});
		}
		res.status(200).json({
			ok: true,
			mensaje: 'Material Eliminado con éxito',
			eventos: mantenimiento.materiales
		});

	});
});


// ==========================================
// Remover Mantenimiento
// ==========================================

app.delete('/mantenimiento/:id', async (req, res) => {

	const mantenimiento = await mantenimientosController.getMantenimiento(req, res);

	if (mantenimiento && mantenimiento._id) {
		if (mantenimiento.finalizado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No se puede eliminar un mantenimiento ya finalizado',
				errors: { message: 'No se puede eliminar un mantenimiento ya finalizado' }
			});
		}
		if (mantenimiento.materiales && mantenimiento.materiales.length > 0) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No se puede eliminar un mantenimiento si ya cuenta con materiales cargados.',
				errors: { message: 'No se puede eliminar un mantenimiento si ya cuenta con materiales cargados.' }
			});
		}

		const maniobra = await maniobrasController.getManiobra({ params: { id: mantenimiento.maniobra } });
		if (maniobra.estatus === "LAVADO_REPARACION") {
			let losdemasFinalizados = true;
			let estatus = "DISPONIBLE";
			const mantenimientos = await mantenimientosController.getMantenimientos({ query: { maniobra: mantenimiento.maniobra } }, res);
			mantenimientos.filter(m => !m._id.equals(mantenimiento._id)).forEach(m => {
				losdemasFinalizados = m.finalizado && losdemasFinalizados;
			});
			if (!losdemasFinalizados) estatus = "LAVADO_REPARACION";
			const updteManiobra = await maniobrasController.updateEstatus(mantenimiento.maniobra, estatus);
		}

		folder = `mantenimientos/${mantenimiento._id}/`;
		var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
		var params = {
			Bucket: entorno.BUCKET,
			Prefix: folder
		}
		const deleteParams = {
			Bucket: entorno.BUCKET,
			Delete: { Objects: [] },
		};
		await s3.listObjectsV2(params, function (err, data) {
			data.Contents.forEach(d => {
				deleteParams.Delete.Objects.push({ Key: d.Key });
			});
			if (deleteParams.Delete.Objects.length > 0)
				s3.deleteObjects(deleteParams, function (err, data) {
					if (err) console.log(err, err.stack);
				});
		});

		await mantenimiento.remove((err, elim) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error al borrar el mantenimiento',
					errors: err
				});
			}
			res.status(200).json({
				ok: true,
				mensaje: 'Mantenimiento eliminado con éxito',
				mantenimiento: elim
			});
		});



	} else
		return res.status(500).json({
			ok: false,
			mensaje: 'No se pudo obtener información del mantenimiento, Intentar de nuevo.',
			errors: 'No se pudo obtener información del mantenimiento, Intentar de nuevo.'
		});
});


app.put('/mantenimiento/:id/adjunta_pdf_folio', mdAutenticacion.verificaToken, (req, res) => {
	if (!req.files) {
		return res.status(400).json({
			ok: false,
			mensaje: 'No anexo archivos.',
			errors: { message: 'Debe de seleccionar un archivo' }
		});
	}
	var id = req.params.id;
	var archivo = req.files.file;
	var nombreCortado = archivo.name.split('.');
	var extensionArchivo = nombreCortado[nombreCortado.length - 1];
	var extensionesValidas = ['pdf', 'PDF'];
	if (extensionesValidas.indexOf(extensionArchivo) < 0) {
		return res.status(400).json({
			ok: false,
			mensaje: 'Extension no válida',
			errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
		});
	}

	var nombreArchivo = `${uuid()}.${extensionArchivo}`;

	var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
	var params = {
		Bucket: entorno.BUCKET,
		Body: archivo.data,
		Key: 'mantenimientos/' + id + "/" + nombreArchivo,
		ContentType: archivo.mimetype
	};

	s3.upload(params, function (err, data) {
		if (err) {
			console.log("Error", err);
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al Subir archivo',
				errors: err
			});
		}
		if (data) {
			console.log("Uploaded in:", data.Location);
			Mantenimiento.findById(id, (err, mantenimiento) => {
				if (err) {
					return res.status(500).json({
						ok: false,
						mensaje: 'Error al buscar el mantenimiento',
						errors: err
					});
				}
				if (!mantenimiento) {
					return res.status(400).json({
						ok: false,
						mensaje: 'El mantenimiento con el id ' + id + ' no existe',
						errors: { message: 'No existe mantenimiento con ese ID' }
					});
				}

				mantenimiento.fileFolio = nombreArchivo;
				mantenimiento.save((err, mantenimientoGuardado) => {
					if (err) {
						return res.status(400).json({
							ok: false,
							mensaje: 'Error al actualizar el mantenimiento',
							errors: err
						});
					}
					res.status(200).json({
						ok: true,
						mensaje: 'Archivo colocado con éxito',
						nombreArchivo: nombreArchivo,
						path: data.Location
					});
				});
			});
		}
	});

});

app.get('/mantenimiento/:id/descarga_pdf_folio/:name', (req, res, netx) => {
	const id = req.params.id;
	const nombre = req.params.name;
	var s3 = new AWS.S3(entorno.CONFIG_BUCKET);

	var params = {
		Bucket: entorno.BUCKET,
		Key: 'mantenimientos/' + id + "/" + nombre
	};
	s3.getObject(params, (err, data) => {
		if (err) {
			res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
		} else {
			res.setHeader('Content-disposition', 'atachment; filename=' + nombre);
			res.setHeader('Content-length', data.ContentLength);
			res.send(data.Body);
		}
	});

});
//descarga_pdf_folio
// ==========================================

// Subir fotos ANTES o DESPUES
// ==========================================
app.put('/mantenimiento/:id/upfoto/:AD', (req, res) => {

	var id = req.params.id;
	var AD = req.params.AD;

	if (!req.files) {
		return res.status(400).json({
			ok: false,
			mensaje: 'No selecciono nada',
			errors: { message: 'Debe de seleccionar una imagen' }
		});
	}
	// Obtener nombre del archivo
	var archivo = req.files.file;
	var nombreCortado = archivo.name.split('.');
	var extensionArchivo = nombreCortado[nombreCortado.length - 1];
	var nombreArchivo = `${uuid()}.${extensionArchivo}`;
	var path = 'mantenimientos/' + id + '/';

	if (AD === "ANTES")
		path = path + 'fotos_antes/';
	else
		if (AD === "DESPUES")
			path = path + 'fotos_despues/';

	variasBucket.SubirArchivoBucket(archivo, path, nombreArchivo)
		.then((value) => {
			if (value) {
				res.status(200).json({
					ok: true,
					mensaje: 'Archivo guardado!',
				});
			}
		});
});

// RECUPERAR LISTA DE  Fotos antes y despues
app.get('/mantenimiento/:id/fotos/:AD/', (req, res, netx) => {
	var idMantenimiento = req.params.id;
	var antes_despues = req.params.AD;
	var pathFotos = "";

	if (antes_despues === 'ANTES') {
		pathFotos = `mantenimientos/${idMantenimiento}/fotos_antes/`;
	} else {
		if (antes_despues === 'DESPUES') {
			pathFotos = `mantenimientos/${idMantenimiento}/fotos_despues/`;
		}
	}

	var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
	var params = {
		Bucket: entorno.BUCKET,
		Prefix: pathFotos,
	};
	s3.listObjects(params, function (err, data) {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No se encontraron fotos',
				errors: { message: 'No existen fotos para mantenimiento con ID: ' + idMantenimiento }
			});
		} else {
			// console.log(data.Contents); // successful response
			res.status(200).json({
				ok: true,
				// fotos: JSON.parse(JSON.stringify(array)),
				fotos: data.Contents,
				total: data.Contents.length
			});
		}
	});
});

// Recupera Foto por medio de la ruta completa..
app.get('/mantenimiento/getfoto', (req, res, netx) => {
	var img = req.query.ruta;

	if (!img) {
		res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
	} else {
		var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
		var params = {
			Bucket: entorno.BUCKET,
			Key: img
		};

		s3.getObject(params, (err, data) => {
			if (err) {
				console.error('ERROR EN CALLBACK ' + img);
				res.sendFile(path.resolve(__dirname, '../assets/no-img.jpg'));
			} else {
				res.setHeader('Content-disposition', 'atachment; filename=' + img);
				res.setHeader('Content-length', data.ContentLength);
				res.send(data.Body);
			}
		});
	}
});

// ============================================
//   Borrar Foto de Mantenimiento desde Bucket 
// ============================================
app.get('/mantenimiento/:id/eliminafoto/:AD/:name', (req, res, netx) => {
	var id = req.params.id;
	var a_d = req.params.AD;
	var nameimg = req.params.name;

	var pathfoto;
	if (a_d === 'ANTES') {
		pathfoto = `mantenimientos/${id}/fotos_antes/${nameimg}`;
	} else {
		if (a_d === 'DESPUES') {
			pathfoto = `mantenimientos/${id}/fotos_despues/${nameimg}`;
		}
	}

	variasBucket.BorrarArchivoBucketKey(pathfoto)
		.then((value) => {
			if (value) {
				res.status(200).json({
					ok: true,
					mensaje: 'Foto Eliminada!',
				});
			}
		});
});



app.get('/mantenimiento/:id/getfotoszip/:AD', (req, res, netx) => {
	var idMantenimiento = req.params.id;
	var antes_despues = req.params.AD;
	var folder = "";
	folder = `mantenimientos/${idMantenimiento}/`;
	const files = [];

	var s3 = new AWS.S3(entorno.CONFIG_BUCKET);
	var bucket = entorno.BUCKET;
	var params = {
		Bucket: entorno.BUCKET,
		Prefix: folder
	}
	s3.listObjectsV2(params, function (err, data) {
		if (err) {

			return res.status(400).json({
				ok: false,
				mensaje: 'Hubo un error al consultar las fotos del ANTES',
				errors: { message: 'Hubo un error al consultar las fotos del ANTES ' + idMantenimiento }
			});
		} else {
			data.Contents.forEach(d => {
				const img = d.Key.substr(folder.length);
				if (img.substr(0, 11) === "fotos_antes" && antes_despues !== "DESPUES") files.push(img);
				if (img.substr(0, 13) === "fotos_despues" && antes_despues !== "ANTES") files.push(img);
			});
		}
		if (files.length > 0) s3Zip.archive({ s3: s3, bucket: bucket, preserveFolderStructure: true }, folder, files).pipe(res, `${idMantenimiento}.zip`);
		else {
			return res.status(400).json({
				ok: false,
				mensaje: 'No se encontraron fotos.',
				errors: { message: 'No se encontraron fotos del mantenimiento: ' + idMantenimiento }
			});
		}
	});
});

// Migrar fotos de maniobras a mantenimientos (BUCKET)
// ==========================================
// app.get('/migracion/fotos', mdAutenticacion.verificaToken, (req, res, next) => {

//   // Mantenimiento.find({maniobra: '5fcbc717461c4f05583690cd'})
//   Mantenimiento.find()
//     .sort({ fAlta: -1 })
//     .exec((err, mantenimientos) => {
//       if (err) {
//         return res.status(500).json({
//           ok: false,
//           mensaje: 'Error al cargar mantenimientos',
//           errors: err
//         });
//       }

//       mantenimientos.forEach(async(man) => {
//         var LR = man.tipoMantenimiento == 'LAVADO' ? 'fotos_lavado' : 'fotos_reparacion'
//         var ruta = 'maniobras/' + man.maniobra + '/' + LR + '/';
//         var rutaDestino = 'mantenimientos/' + man._id + '/fotos_despues/';
//         variasBucket.ListaArchivosBucket(ruta).then(data => {
//           data.forEach(d => {
//             const rutaBase = d.Key.substring(0, d.Key.lastIndexOf('/') + 1);
//             const nombreArchivo = d.Key.substring(d.Key.lastIndexOf('/') + 1, d.Key.length);
//             variasBucket.CopiarArchivoBucket(rutaBase, nombreArchivo, rutaDestino);
//           });
//         });
//       });
//       res.status(200).json({
//         ok: true,
//         mantenimientos,
//         total: mantenimientos.length
//       });
//     });
// });

module.exports = app;