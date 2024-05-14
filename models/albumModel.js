const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data.json");

require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();
const ALBUMS_BUCKET_NAME = "bucket-exercice-nodejs";

class AlbumModel {

    static async getAllAlbums() {
        try {
            const albums = await s3.listObjectsV2({ Bucket: ALBUMS_BUCKET_NAME }).promise();
            // Extract object keys from the response and fetch each album individually
            const albumKeys = albums.Contents.map(obj => obj.Key);
            const albumsData = await Promise.all(albumKeys.map(key => s3.getObject({ Bucket: ALBUMS_BUCKET_NAME, Key: key }).promise()));
            return albumsData.map(album => JSON.parse(album.Body.toString()));
        } catch (e) {
            console.error("Erreur lors de la récupération des albums: ", e);
            return [];
        }
    }
    

  static async getAlbumById(id) {
    const albums = await this.getAllAlbums();
    return albums.find((album) => album.id === id);
  }

  static async createAlbum(title, description) {
    console.log("title: ", title);
    try {
      const params = {
        Bucket: ALBUMS_BUCKET_NAME,
        Key: `${title}/`,
        Body: "",
      };
      console.log("params:", params);
      await s3.putObject(params).promise();
    } catch (e) {
      console.error("Erreur lors de la création de l'album: ", e);
    }
  }

  static async updateAlbum(id, newAlbum) {
    try {
      const albums = await this.getAllAlbums();
      const index = albums.findIndex((album) => album.id === id);
      if (index !== -1) {
        albums[index] = { ...albums[index], ...newAlbum };
        await s3
          .putObject({
            Bucket: ALBUMS_BUCKET_NAME,
            Key: newAlbum.title,
            Body: JSON.stringify(albums),
          })
          .promise();
      }
    } catch (e) {
      console.error("Erreur lors de la mise à jour de l'album: ", e);
    }
  }

  static async deleteAlbum(title) {
    try {
      const albums = await this.getAllAlbums();
      const filteredAlbums = albums.filter((album) => album.title !== title);
      await s3
        .putObject({
          Bucket: ALBUMS_BUCKET_NAME,
          Key: title,
          Body: JSON.stringify(filteredAlbums),
        })
        .promise();
    } catch (e) {
      console.error("Erreur lors de la suppression de l'album: ", e);
    }
  }

  static async addPhotoToAlbum(albumTitle, photo) {
    try {
      const albums = await this.getAllAlbums();
      const album = albums.find((album) => album.title === albumTitle);
      if (album) {
        if (!album.photos) {
          album.photos = [];
        }
        album.photos.push({ ...photo, id: Date.now(), albumTitle });
        await s3
          .putObject({
            Bucket: ALBUMS_BUCKET_NAME,
            Key: albumTitle,
            Body: JSON.stringify(album),
          })
          .promise();
        return true;
      }
      return false;
    } catch (e) {
      console.error(
        `Erreur lors de l'ajout d'une photo à l'album ${albumTitle}: `,
        e
      );
      return false;
    }
  }

  static async getPhotosByAlbumTitle(albumTitle) {
    try {
      const albumData = await s3
        .getObject({ Bucket: ALBUMS_BUCKET_NAME, Key: albumTitle })
        .promise();
      const album = JSON.parse(albumData.Body.toString());
      return album.photos || [];
    } catch (e) {
      console.error(
        `Erreur lors de la récpération des photos pour l'album: ${albumTitle}: `,
        e
      );
      return [];
    }
  }

  static async deletePhoto(photoId) {
    try {
      const albums = await this.getAllAlbums();
      const album = albums.find(
        (album) =>
          album.photos && album.photos.some((photo) => photo.id === photoId)
      );
      if (album) {
        album.photos = album.photos.filter((photo) => photo.id !== photoId);
        await s3
          .putObject({
            Bucket: ALBUMS_BUCKET_NAME,
            Key: album.title,
            Body: JSON.stringify(album),
          })
          .promise();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Erreur lors de la supression de la photo: ", e);
      return false;
    }
  }
}

module.exports = AlbumModel;
