const express = require('express');
const albumsController = require('../controllers/albumsController');

const router = express.Router();

// Routes for albums
router.post('/albums', albumsController.createAlbum);
router.get('/albums', albumsController.getAllAlbums);
router.get('/albums/:id', albumsController.getAlbumById);
router.put('/albums/:id', albumsController.updateAlbum);
router.delete('/albums/:title', albumsController.deleteAlbum);

// Routes for photos
router.post('/albums/:albumId/photos', albumsController.uploadPhoto, albumsController.addPhotoToAlbum);
router.get('/albums/:albumId/photos', albumsController.getPhotosByAlbum);
router.delete('/photos/:photoId', albumsController.deletePhoto);


module.exports = router;
