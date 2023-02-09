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
  fetch(config.DOMAIN + '/tunes/' + req.params.id + '/prompts?offset=0', options).then(r => {
    return r.json();
  }).then(jsonResponse => {
    return res.render(__dirname + '/../views/gallery.html', { data: JSON.stringify(jsonResponse) });
  });
};

module.exports = {
  showTune: showTune
};