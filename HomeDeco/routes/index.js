var express = require('express');
var router = express.Router();
var novedadesModels = require('../modelo/novedadesModels');
var cloudinary = require('cloudinary').v2;

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    var novedades = await novedadesModels.getNovedades();


    novedades = novedades.splice(0, 5);

    novedades = novedades.map(novedad => {
      if (novedad.img_id) {
        const imagen = cloudinary.url(novedad.img_id, {
          width: 460,
          
          height: 400,
          crop: 'fill'
        });

        return {
          ...novedad,
          imagen
        };
      } else {
        return {
          ...novedad,
          imagen: '/images/noimage.jpg'
        };
      }
    });

    res.render('index', { novedades, title: 'Express' });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});


module.exports = router;
