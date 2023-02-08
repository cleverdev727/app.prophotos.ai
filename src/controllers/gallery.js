const path = require("path");
const config = require('../config/config');
const fetch = require("node-fetch");
const { json } = require("express");

const showTune = (req, res) => {
  let options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.API_KEY}`
    }
  };
  fetch(config.DOMAIN + '/tunes/' + req.params.id, options).then(r => {
    return r.json();
  }).then(jsonResponse => {
    console.log(typeof(jsonResponse));
    return res.render(__dirname + '/../views/gallery.html', { ...jsonResponse });
  });
};

module.exports = {
  showTune: showTune
};