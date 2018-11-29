var express = require('express');
var router = express.Router();

// Controller modules
var deelname_controller = require('../controllers/deelnameController');
var wedstrijd_controller = require('../controllers/wedstrijdController');
var sportfeest_controller = require('../controllers/sportfeestController');
var locatie_controller = require('../controllers/locatieController');
var discipline_controller = require('../controllers/disciplineController');
var speler_controller = require('../controllers/spelerController');
var index_controller = require('../controllers/indexController');
var provincie_controller = require('../controllers/provincieController');


/// Deelname routes ///

// GET request voor toevoegen deelname
router.get('/deelname/create', deelname_controller.deelname_create_get);

// POST request voor toevoegen deelname
router.post('/deelname/create', deelname_controller.deelname_create_post);

// GET request voor verwijderen deelname
router.get('/deelname/:id/delete', deelname_controller.deelname_delete_get);

// POST request voor verwijderen deelname
router.post('/deelname/:id/delete', deelname_controller.deelname_delete_post);

// GET request voor aanpassen deelname
router.get('/deelname/:id/update', deelname_controller.deelname_update_get);

// POST request voor aanpassen deelname
router.post('/deelname/:id/update', deelname_controller.deelname_update_post);

// GET request voor 1 deelname
router.get('/deelname/:id', deelname_controller.deelname_detail);

// GET request voor de lijst met alle deelnames
router.get('/deelnames', deelname_controller.deelname_list);

// GET request voor wedstrijden horende bij een sportfeest in deelnameform
router.get('/getWedstrijden/:id', deelname_controller.get_wedstrijdensportfeest);



/// Wedstrijd routes ///

// GET menu home page -------------- kan nog aangepast worden   -   -   -   -   -   -   -   -   -       --  -   -   -
router.get('/', index_controller.index);

// GET request voor toevoegen wedstrijd
router.get('/wedstrijd/create', wedstrijd_controller.wedstrijd_create_get);

// POST request voor toevoegen wedstrijd
router.post('/wedstrijd/create', wedstrijd_controller.wedstrijd_create_post);

// GET request voor verwijderen wedstrijd
router.get('/wedstrijd/:id/delete', wedstrijd_controller.wedstrijd_delete_get);

// POST request voor verwijderen wedstrijd
router.post('/wedstrijd/:id/delete', wedstrijd_controller.wedstrijd_delete_post);

// GET request voor aanpassen wedstrijd
router.get('/wedstrijd/:id/update', wedstrijd_controller.wedstrijd_update_get);

// POST request voor aanpassen wedstrijd
router.post('/wedstrijd/:id/update', wedstrijd_controller.wedstrijd_update_post);

// GET request voor 1 wedstrijd
router.get('/wedstrijd/:id', wedstrijd_controller.wedstrijd_detail);

// GET request voor de lijst met alle wedstrijden
//router.get('/wedstrijden', wedstrijd_controller.wedstrijd_list);



/// Sportfeest routes ///

// GET request voor toevoegen sportfeest
router.get('/sportfeest/create', sportfeest_controller.sportfeest_create_get);

// POST request voor toevoegen sportfeest
router.post('/sportfeest/create', sportfeest_controller.sportfeest_create_post);

// GET request voor verwijderen sportfeest
router.get('/sportfeest/:id/delete', sportfeest_controller.sportfeest_delete_get);

// POST request voor verwijderen locatie
router.post('/sportfeest/:id/delete', sportfeest_controller.sportfeest_delete_post);

// GET request voor aanpassen sportfeest
router.get('/sportfeest/:id/update', sportfeest_controller.sportfeest_update_get);

// POST request voor verwijderen locatie
router.post('/sportfeest/:id/update', sportfeest_controller.sportfeest_update_post);

// GET request voor 1 locatie
router.get('/sportfeest/:id', sportfeest_controller.sportfeest_detail);

// GET request voor de lijst met alle locaties
router.get('/sportfeesten', sportfeest_controller.sportfeest_list);



/// Locatie routes ///

// GET request voor toevoegen locatie
router.get('/locatie/create', locatie_controller.locatie_create_get);

// POST request voor toevoegen locatie
router.post('/locatie/create', locatie_controller.locatie_create_post);

// GET request voor verwijderen locatie
router.get('/locatie/:id/delete', locatie_controller.locatie_delete_get);

// POST request voor verwijderen locatie
router.post('/locatie/:id/delete', locatie_controller.locatie_delete_post);

// GET request voor aanpassen locatie
router.get('/locatie/:id/update', locatie_controller.locatie_update_get);

// POST request voor aanpassen locatie
router.post('/locatie/:id/update', locatie_controller.locatie_update_post);

// GET request voor 1 locatie
router.get('/locatie/:id', locatie_controller.locatie_detail);

// GET request voor de lijst met alle locaties
router.get('/locaties', locatie_controller.locatie_list);



/// Discipline routes ///

// GET request voor toevoegen discipline
router.get('/discipline/create', discipline_controller.discipline_create_get);

// POST request voor toevoegen discipline
router.post('/discipline/create', discipline_controller.discipline_create_post);

// GET request voor verwijderen discipline
router.get('/discipline/:id/delete', discipline_controller.discipline_delete_get);

// POST request voor verwijderen discipline
router.post('/discipline/:id/delete', discipline_controller.discipline_delete_post);

// GET request voor aanpassen discipline
router.get('/discipline/:id/update', discipline_controller.discipline_update_get);

// POST request voor aanpassen discipline
router.post('/discipline/:id/update', discipline_controller.discipline_update_post);

// GET request voor 1 discipline
router.get('/discipline/:id', discipline_controller.discipline_detail);

// GET request voor de lijst met alle disciplines
router.get('/disciplines', discipline_controller.discipline_list);




/// Speler routes ///

// GET request voor toevoegen speler
router.get('/speler/create', speler_controller.speler_create_get);

// POST request voor toevoegen speler
router.post('/speler/create', speler_controller.speler_create_post);

// GET request voor verwijderen speler
router.get('/speler/:id/delete', speler_controller.speler_delete_get);

// POST request voor verwijderen speler
router.post('/speler/:id/delete', speler_controller.speler_delete_post);

// GET request voor aanpassen speler
router.get('/speler/:id/update', speler_controller.speler_update_get);

// POST request voor aanpassen speler
router.post('/speler/:id/update', speler_controller.speler_update_post);

// GET request voor 1 speler
router.get('/speler/:id', speler_controller.speler_detail);

// GET request voor de lijst met alle spelers
router.get('/spelers', speler_controller.speler_list);



/// Provincie routes ///

// GET request voor 1 provincie
router.get('/provincie/:provincienaam', provincie_controller.provincie_detail);

module.exports = router;
