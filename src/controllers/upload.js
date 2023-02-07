const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const FormData = require('form-data');
const fs = require('fs');
const fetch = require("node-fetch");
const { json } = require("express");

const API_KEY = 'sd_qQGvqK48YTDmMT68knUsgrQSDPM7jD';
const DOMAIN = 'https://api.astria.ai';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadFiles = upload.array("images", 50);

const uploadImages = (req, res, next) => {
  uploadFiles(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.send("Too many files to upload.");
      }
    } else if (err) {
      return res.send(err);
    }

    next();
  });
};

const resizeImages = async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];
  await Promise.all(
    req.files.map(async file => {
      const filename = file.originalname.replace(/\..+$/, "");
      const newFilename = `bezkoder-${filename}-${Date.now()}.jpeg`;

      await sharp(file.buffer)
        // .resize(640, 320)
        .toFormat("jpeg")
        // .jpeg({ quality: 90 })
        .toFile(`upload/${newFilename}`);

      req.body.images.push(newFilename);
    })
  );

  next();
};

const getResult = async (req, res) => {
  if (req.body.images.length <= 0) {
    return res.send(`You must select at least 1 image.`);
  }

  const images = req.body.images
    .map(image => "" + image + "")
    .join("");

  // return res.send(`Images were uploaded:${images}`);
  createTune(req, res);
  // return res.sendFile(path.join(`${__dirname}/../views/loading.html`));
};

const createTune = (req, res) => {
  let formData = new FormData();
  formData.append('tune[title]', 'My Tune');
  formData.append('tune[branch]', 'fast');
  formData.append('tune[token]', 'zwx');
  formData.append('tune[name]', 'man');

  req.body.images.forEach(image => {
    formData.append('tune[images][]', fs.createReadStream(`upload/${image}`), image);
  });
  formData.append('tune[callback]', 'https://optional-callback-url.com/to-your-service-when-ready');

  let options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    },
    body: formData
  };
  fetch(DOMAIN + '/tunes', options).then(r => {
    return r.json();
  }).then(jsonResponse => {
    console.log(jsonResponse);
    // return jsonResponse;
    return res.redirect(`/gallery/${jsonResponse.id}`);
  });
}

module.exports = {
  uploadImages: uploadImages,
  resizeImages: resizeImages,
  getResult: getResult
};