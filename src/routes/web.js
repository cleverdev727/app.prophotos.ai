const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");
const galleryController = require("../controllers/gallery");
const uploadController = require("./../controllers/upload");

let routes = app => {
  router.get("/", homeController.getHome);

  router.post(
    "/multiple-upload",
    uploadController.uploadImages,
    uploadController.resizeImages,
    uploadController.getResult
  );

  router.get('/gallery/:id', galleryController.showTune);

  return app.use("/", router);
};

module.exports = routes;