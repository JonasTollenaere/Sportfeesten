var express = require('express');
var router = express.Router();


// Controller modules
var user_controller = require('../controllers/userController');

/// Login routes ///

// GET request voor inloggen
router.get('/login', user_controller.login_get);

// POST request voor inloggen
router.post('/login', user_controller.login_post);

// GET request voor uitloggen
router.get('/logout', user_controller.logout_get);

// GET request voor logininformatie (gebruikt voor script achter loginknop, ajax)
router.get('/getGebruikerInfo', user_controller.get_gebruiker_info);



module.exports = router;
