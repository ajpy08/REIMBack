const express = require('express');
const mdAutenticacion = require('../middlewares/autenticacion');
const app = express();
const mermasController = require('../controllers/mermasController');

// ==========================================
//  Obtener todas las Mermas
// ==========================================

app.get('/', mdAutenticacion.verificaToken, (req, res) => {
    const resultMermas = mermasController.consultaMermas(req, res);
    resultMermas.then(mermas => {
        res.status(200).json({
            ok: true,
            mermas,
            totalRegistros: mermas.length
        });
    }).catch(error => {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando mermas',
            errors: error
        });
    });
});

// ==========================================
//  Obtener todas las Mermas Aprobadas
// ==========================================

app.get('/aprobadas/', mdAutenticacion.verificaToken, (req, res) => {
    const resultMermas = mermasController.consultaMermasAprobadas(req, res);
    resultMermas.then(mermas => {
        res.status(200).json({
            ok: true,
            mermas,
            totalRegistros: mermas.length
        });
    }).catch(error => {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando mermas',
            errors: error
        });
    });
});

// ==========================================
//  Obtener Merma por ID
// ==========================================
app.get('/merma/:id', mdAutenticacion.verificaToken, (req, res) => {
    const getMerma = mermasController.consultaMermaById(req, res);
    getMerma.then(merma => {
        if (merma) {
            res.status(200).json({
                ok: true,
                merma,
            });
        } else {
            return res.status(400).json({
                ok: false,
                mensaje: `La merma con el id ${req.params.id} no existe`,
                errors: { message: 'No existe una merma con ese ID' }
            });
        }
    }).catch(error => {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error buscando merma',
            errors: error
        });
    });
});

// ==========================================
// Crear una nueva merma
// ==========================================
app.post('/merma/', mdAutenticacion.verificaToken, (req, res) => {
    const resultMerma = mermasController.creaMerma(req, res);
    resultMerma.then(merma => {
        if (merma) {
            res.status(200).json({
                ok: true,
                merma,
                mensaje: 'Merma creada con éxito.',
            });
        }
    }).catch(error => {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear merma',
            errors: error
        });
    });
});

// ==========================================
// Actualizar merma
// ==========================================

app.put('/merma/:id', mdAutenticacion.verificaToken, (req, res) => {
    const getMerma = mermasController.consultaMermaById(req, res);
    getMerma.then(merma => {
        if (merma) {
            if (!merma.fAprobacion) {
                req.body.merma = merma;
                const resultMerma = mermasController.actualizaMerma(req, res);
                resultMerma.then(merma => {
                    if (merma) {
                        res.status(200).json({
                            ok: true,
                            merma,
                            mensaje: 'Merma actualizada con éxito.',
                        });
                    }
                }).catch(error => {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar merma',
                        errors: error
                    });
                });
            } else {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No puedes actualizar esta merma por que ya esta aprobada.',
                    errors: { message: 'No puedes actualizar esta merma por que ya esta aprobada.' }
                });
            }
        } else {
            return res.status(400).json({
                ok: false,
                mensaje: `La merma con el id ${req.params.id} no existe`,
                errors: { message: 'No existe una merma con ese ID' }
            });
        }
    });
});

// ============================================
//  Borrar un Merma por el id
// ============================================
app.delete('/merma/:id', mdAutenticacion.verificaToken, (req, res) => {
    const getMerma = mermasController.consultaMermaById(req, res);
    getMerma.then(merma => {
        if (merma) {
            if (!merma.fAprobacion) {
                req.body.merma = merma;
                const resultElimina = mermasController.eliminarMerma(req, res);
                resultElimina.then(merma => {
                    res.status(200).json({
                        ok: true,
                        merma
                    });
                }).catch(() => {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al borrar la merma',
                        errors: err
                    });
                });
            } else {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No puedes eliminar esta merma por que ya esta aprobada.',
                    errors: { message: 'No puedes eliminar esta merma por que ya esta aprobada.' }
                });
            }
        } else {
            return res.status(400).json({
                ok: false,
                mensaje: `La merma con el id ${req.params.id} no existe`,
                errors: { message: 'No existe una merma con ese ID' }
            });
        }
    }).catch(error => {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error buscando merma',
            errors: error
        });
    });
});

// ==========================================
// Aprobar Merma 
// ==========================================
app.put('/aprobar/merma/:id', mdAutenticacion.verificaToken, (req, res) => {

    if (req.usuario.role === 'ADMIN_ROLE' || req.usuario.role === 'PATIOADMIN_ROLE') {
        const aprobarMerma = mermasController.aprobarMerma(req, res);
        aprobarMerma.then(mermaAprobada => {
            res.status(200).json({
                ok: true,
                mermaAprobada
            });
        }).catch(error => {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al aprobar merma',
                errors: error
            });
        });
    } else {
        return res.status(400).json({
            ok: false,
            mensaje: 'No tienes privilegios para aprobar Mermas'
        });
    }
});

// ==========================================
// Desaprobar merma
// ==========================================

app.put('/desaprobar/merma/:id', mdAutenticacion.verificaToken, (req, res) => {
    if (req.usuario.role === 'ADMIN_ROLE' || req.usuario.role === 'PATIOADMIN_ROLE') {
        const desaprobarMerma = mermasController.desaprobarMerma(req, res);
        desaprobarMerma.then(mermaDesaprobada => {
            res.status(200).json({
                ok: true,
                mermaDesaprobada
            });
        }).catch(error => {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al desaprobar merma',
                errors: error
            });
        });
    } else {
        return res.status(400).json({
            ok: false,
            mensaje: 'No tienes privilegios para Desaprobar Mermas'
        });
    }
});
module.exports = app;