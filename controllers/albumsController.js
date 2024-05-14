const AlbumModel = require('../models/albumModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

exports.createAlbum = (req, res) => {
    const { title, description } = req.body;
    console.log("createAlbumController:", req.body)
    AlbumModel.createAlbum(title, description);
    res.status(201).send({ message: 'Album created successfully' });
};

exports.getAllAlbums = (req, res) => {
    const albums = AlbumModel.getAllAlbums();
    res.send(albums);
};

exports.getAlbumById = (req, res) => {
    const album = AlbumModel.getAlbumById(parseInt(req.params.id));
    if (album) {
        res.send(album);
    } else {
        res.status(404).send({ message: 'Album not found' });
    }
};

exports.updateAlbum = (req, res) => {
    const { title, description } = req.body;
    AlbumModel.updateAlbum(parseInt(req.params.id), { title, description });
    res.send({ message: 'Album updated successfully' });
};

exports.deleteAlbum = (req, res) => {
    AlbumModel.deleteAlbum(parseInt(req.params.title));
    res.send({ message: 'Album deleted successfully' });
};

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});

const upload = multer({ storage: storage });

exports.uploadPhoto = upload.single('photo');

exports.addPhotoToAlbum = (req, res) => {
    const albumId = parseInt(req.params.albumId);
    if (req.file) {
        const result = AlbumModel.addPhotoToAlbum(albumId, {
            title: req.body.title,
            description: req.body.description,
            path: req.file.path
        });
        if (result) {
            res.send({ message: 'Photo added successfully' });
        } else {
            res.status(404).send({ message: 'Album not found' });
        }
    } else {
        res.status(400).send({ message: 'No photo uploaded' });
    }
};

exports.getPhotosByAlbum = (req, res) => {
    const albumTitle = parseInt(req.params.title);
    const photos = AlbumModel.getPhotosByAlbumTitle(albumTitle);
    res.send(photos);
};

exports.deletePhoto = (req, res) => {
    AlbumModel.deletePhoto(parseInt(req.params.photoId));
    res.send({ message: 'Photo deleted successfully' });
};
