const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middlewares');

const MovieControllers = require('../controllers/movie.controllers.js');

router.get('/getMovies', verifyToken, MovieControllers.getAllMovies);
router.post('/createMovie', verifyToken, MovieControllers.createMovie);
router.get('/getMovie/:id', verifyToken, MovieControllers.getMovieById);
router.put('/updateMovie/:id', verifyToken, MovieControllers.updateMovie);
router.delete('/deleteMovie/:id', verifyToken, MovieControllers.deleteMovie);
router.get('/searchMovie/:title', verifyToken, MovieControllers.searchMovie);

module.exports = router;
