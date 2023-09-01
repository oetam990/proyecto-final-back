var express = require('express');
var router = express.Router();
var propiedadesModel = require('../models/propiedadesModel');
var cloudinary = require('cloudinary').v2;
var nodemailer = require('nodemailer');

router.get('/propiedades', async function (req, res, next) {
    let destacada = req.query.destacada
    let propiedades = await propiedadesModel.index(destacada);
    
    propiedades = propiedades.map(propiedades => {
        if (propiedades.img_principal) {
            const imagen = cloudinary.url(propiedades.img_principal, {
            });
            return {
                ...propiedades,
                imagen
            }
        } else {
            return {
                ...propiedades,
                imagen: ''
            }
        }
    });
    res.json(propiedades);
});

router.post('/contacto', async function (req, res) {
    const mail = {
        from: 'contacto@inmobiliaria.com',
        to: req.body.email,
        subject: 'Contacto Diplo',
        html: `${req.body.nombre} se contactó a traves de la web y quiere más infirmación a este correo: ${req.body.email} <br> Además, hizo el siguiente comentario: ${req.body.mensaje} <br> Su tel es: ${req.body.telefono}`
    }
    
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
    });

    await transport.sendMail(mail)

    res.status(201).json({
        error: false,
        message: "Mensaje enviado"
    });
});

router.get('/propiedad/:id', async function (req, res, next) {
    const propiedadId = req.params.id;
    let propiedad = await propiedadesModel.show(propiedadId);
    propiedad = propiedad.map(propiedad => {
        if (propiedad.img_principal) {
            const imagen = cloudinary.url(propiedad.img_principal, {
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

    res.json(propiedad);
});

module.exports = router;