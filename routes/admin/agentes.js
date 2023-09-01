var express = require('express');
var router = express.Router();
var pool = require('../../models/db');
var md5 = require('md5');
var agentesModel = require('../../models/agentesModel');
var usuariosModel = require('../../models/usuarioModel');
var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload)
const destroy = util.promisify(cloudinary.uploader.destroy)

/* GET home page. */
router.get('/', async function (req, res, next) {
    var agentes = await agentesModel.index();
    agentes = agentes.map(agente => {
        if (agente.img_perfil) {
            const imagen = cloudinary.image(agente.img_perfil, {
                width: 70,
                height: 70,
                crop: 'fill'
            });
            return {
                ...agente,
                imagen
            }
        } else {
            return {
                ...agente,
                imagen: ''
            }
        }
    });
    res.render('admin/agentes/index', {
        layout: 'admin/layout',
        rol: req.session.rol,
        nombre: req.session.nombre,
        imagen: req.session.imagen,
        agentes
    });
});

router.get('/crear', function (req, res, next) {
    res.render('admin/agentes/create', {
        layout: 'admin/layout',
        rol: req.session.rol,
        nombre: req.session.nombre,
        imagen: req.session.imagen
    });
});

router.post('/crear', async (req, res, next) => {
    try {
        var img_id = '';
        if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }
        if (req.body.nombre && req.body.apellido && req.body.username && req.body.password) {
            const usernameExists = await pool.query('SELECT * FROM usuarios WHERE username = ? && estado = ?', [req.body.username, 1]);

            if (usernameExists.length > 0) {
                return res.render('admin/agentes/create', {
                    layout: 'admin/layout',
                    rol: req.session.rol,
                    nombre: req.session.nombre,
                    error: true, message: 'Nombre de usuario en uso'
                });
            }

            const hashedPassword = md5(req.body.password);
            const objUsuario = {
                username: req.body.username,
                password: hashedPassword,
                rol: 2,
                estado: 1,
                creado: new Date(),
                img_perfil: img_id
            };

            const usuarioResult = await pool.query('INSERT INTO usuarios SET ?', [objUsuario]);

            const objAgente = {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                usuario: usuarioResult.insertId,
                estado: 1,
                creado: new Date()
            };

            await pool.query('INSERT INTO agentes SET ?', [objAgente]);
            res.redirect('/admin/agentes/')
        } else {
            return res.render('admin/agentes/create', {
                layout: 'admin/layout',
                rol: req.session.rol,
                nombre: req.session.nombre,
                error: true, message: 'Todos los campos son requeridos'
            });
        }
    } catch (error) {
        console.log(error);
        return res.render('admin/agentes/create', {
            layout: 'admin/layout',
            rol: req.session.rol,
            nombre: req.session.nombre,
            error: true, message: 'No se pudo crear el agente'
        });
    }
});

router.get('/eliminar/:id', async (req, res, next) => {
    var id = req.params.id;
    let usuario = await usuariosModel.getUsuarioById(id);
    if (usuario.img_perfil) {
        await (destroy(usuario.img_perfil));
    }
    await agentesModel.eliminar(id);
    res.redirect('/admin/agentes/')
});

router.get('/modificar/:id', async (req, res, next) => {
    var id = req.params.id;
    var agente = await agentesModel.getAgenteById(id);
    res.render('admin/agentes/update', {
        layout: 'admin/layout',
        rol: req.session.rol,
        nombre: req.session.nombre,
        imagen: req.session.imagen,
        agente
    });
});

router.post('/modificar', async (req, res, next) => {
    try {
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;
        if (req.body.img_delete === "1") {
            img_id = null;
            borrar_img_vieja = true;
        } else {
            if (req.files && Object.keys(req.files).length > 0) {
                imagen = req.files.imagen
                img_id = (await uploader(imagen.tempFilePath)).public_id;
                borrar_img_vieja = true;
            }
        }
        if (borrar_img_vieja && req.body.img_original) {
            await (destroy(req.body.img_original));
        }

        let objAgente = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            modificado: new Date(),
        }

        let objUsuario= {
            modificado: new Date(),
            img_perfil: img_id
        }
        await agentesModel.update(objAgente, objUsuario, req.body.id_agente, req.body.id);
        return res.redirect('/admin/agentes/');
    } catch (error) {
        console.log(error);
        res.render('admin/agentes/update', {
            layout: 'admin/layout',
            rol: req.session.rol,
            nombre: req.session.nombre,
            error: true, message: 'No se pudo modificar el agente'
        });
    }
});
module.exports = router;
