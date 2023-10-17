var express = require('express');
var router = express.Router();
var novedadesModels = require('../../modelo/novedadesModels');
var cloudinary = require('cloudinary').v2;
const uploader = require('util').promisify(cloudinary.uploader.upload);
const destroy = require('util').promisify(cloudinary.uploader.destroy);

router.get('/', async function (req, res, next) {
  var novedades = await novedadesModels.getNovedades();
  var novedadesConImagenes = await Promise.all(
    novedades.map(async (tendencias) => {
      if (tendencias.img_id) {
        const imagen = cloudinary.url(tendencias.img_id, {
          width: 100,
          height: 100,
          crop: 'fill'
        });
        return {
          ...tendencias,
          imagen
        };
      } else {
        return {
          ...tendencias,
          imagen: ''
        };
      }
    })
  );

  res.render('admin/novedades', {
    layout: 'admin/layout.hbs',
    usuario: req.session.nombre,
    novedades: novedadesConImagenes
  });
});

router.get('/eliminar/:id', async (req, res, next) => {
  var id = req.params.id;

  let novedades = await novedadesModels.getNovedadById(id);
  if (novedades.img_id) {
    await destroy(novedades.img_id);
  }
  

  await novedadesModels.deleteNovedadesById(id);
  res.redirect('/admin/novedades');
});

router.get('/agregar', (req, res, next) => {
  res.render('admin/agregar', {
    layout: 'admin/layout'
  });
});

router.post('/agregar', async (req, res, next) => {
  try {
    var img_id = '';

    if (req.files && req.files.imagen) {
      const imagen = req.files.imagen;
      const uploadResult = await uploader(imagen.tempFilePath);
      img_id = uploadResult.public_id;
    }

    if (req.body.titulo && req.body.cuerpo) {
      const novedad = {
        titulo: req.body.titulo,
        cuerpo: req.body.cuerpo,
        img_id: img_id
      };
      await novedadesModels.insertNovedades(novedad);

      res.redirect('/admin/novedades');
    } else {
      res.render('admin/agregar', {
        layout: 'admin/layout',
        error: true,
        message: 'Todos los campos son requeridos'
      });
    }
  } catch (error) {
    console.error(error);
    res.render('admin/agregar', {
      layout: 'admin/layout',
      error: true,
      message: 'Error al subir nuevo posteo'
    });
  }
});

router.get('/editar/:id', async (req, res, next) => {
  var id = req.params.id;
  var novedades = await novedadesModels.getNovedadById(id);
  res.render('admin/editar', {
    layout: 'admin/layout',
    novedades
  });
});

router.post('/editar', async (req, res, next) => {
  try {
    let img_id = req.body.img_original;
    let borrar_img_vieja = false;
    if (req.body.img_delete === "1") {
      img_id = null;
      borrar_img_vieja = true;
    } else {
      if (req.files && Object.keys(req.files).length > 0) {
        const imagen = req.files.imagen;
        img_id = (await uploader(imagen.tempFilePath)).public_id;
        borrar_img_vieja = true;
      }
    }
    if (borrar_img_vieja && req.body.img_original) {
      await destroy(req.body.img_original);
    }

    var obj = {
      titulo: req.body.titulo,
      cuerpo: req.body.cuerpo,
      img_id
    };

    await novedadesModels.editarNovedadesById(req.body.id, obj);
    res.redirect('/admin/novedades');
  } catch (error) {
    console.error(error);
    res.render('admin/editar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se modificó la novedad'
    });
  }
});

module.exports = router;
