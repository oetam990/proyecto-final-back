var express = require('express');
var router = express.Router();
var pool = require('../../models/db');
var propiedadesModel = require('../../models/propiedadesModel');
var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload)
const destroy = util.promisify(cloudinary.uploader.destroy)
/* GET home page. */
router.get('/', async function (req, res, next) {
    var propiedades = await propiedadesModel.index();
    propiedades = propiedades.map(propiedad => {
        if (propiedad.img_principal) {
            const imagen = cloudinary.image(propiedad.img_principal, {
                width: 100,
                height: 100,
                crop: 'fill'
            });
            return {
                ...propiedad,
                imagen
            }
        } else {
            return {
                ...propiedad,
                imagen: ''
            }
        }
    });
    res.render('admin/propiedades/index', {
        layout: 'admin/layout',
        rol: req.session.rol,
        nombre: req.session.nombre,
        imagen: req.session.imagen,
        propiedades
    });
});

router.get('/crear', function (req, res, next) {
    res.render('admin/propiedades/create', {
        layout: 'admin/layout',
        rol: req.session.rol,
        nombre: req.session.nombre,
        imagen: req.session.imagen
    });
});

router.post('/crear', async (req, res, next) => {
    try {
        const destacada = req.body.destacada === 'on';
        var img_id = '';
        if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }
        if (req.body.titulo && req.body.descripcion && req.body.precio && req.body.pais && req.body.localidad && req.body.habitaciones && req.body.banios) {
            const objPropiedad = {
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                estado: 1,
                precio: req.body.precio,
                pais: req.body.pais,
                localidad: req.body.localidad,
                habitaciones: req.body.habitaciones,
                banios: req.body.banios,
                destacada: destacada,
                usuario: req.session.usuario,
                creado: new Date(),
                img_principal: img_id
            };


            await pool.query('INSERT INTO propiedades SET ?', [objPropiedad]);

            return res.redirect('/admin/propiedades/')
        } else {
            return res.render('admin/propiedades/create', {
                layout: 'admin/layout',
                rol: req.session.rol,
                nombre: req.session.nombre,
                error: true, message: 'Todos los campos son requeridos'
            });
        }
    } catch (error) {
        console.log(error);
        return res.render('admin/propiedades/create', {
            layout: 'admin/layout',
            rol: req.session.rol,
            nombre: req.session.nombre,
            error: true, message: 'No se pudo crear la propiedad'
        });
    }
});

router.get('/eliminar/:id', async (req, res, next) => {
    var id = req.params.id;
    let propiedad = await propiedadesModel.getPropiedadById(id);
    if (propiedad.img_principal) {
        await (destroy(propiedad.img_principal));
    }
    await propiedadesModel.eliminar(id);
    return res.redirect('/admin/propiedades/')
});

router.get('/modificar/:id', async (req, res, next) => {
    var id = req.params.id;
    var propiedad = await propiedadesModel.getPropiedadById(id);
    res.render('admin/propiedades/update', {
        layout: 'admin/layout',
        rol: req.session.rol,
        nombre: req.session.nombre,
        imagen: req.session.imagen,
        propiedad
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

        const destacada = req.body.destacada === 'on';
        let obj = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            pais: req.body.pais,
            localidad: req.body.localidad,
            habitaciones: req.body.habitaciones,
            banios: req.body.banios,
            destacada: destacada,
            modificado: new Date(),
            img_principal: img_id
        }
        await propiedadesModel.update(obj, req.body.id);
        return res.redirect('/admin/propiedades/')
    } catch (error) {
        console.log(error);
        res.render('admin/propiedades/update', {
            layout: 'admin/layout',
            rol: req.session.rol,
            nombre: req.session.nombre,
            error: true, message:'No se pudo modificar la propiedad'
        });
    }
});
module.exports = router;
