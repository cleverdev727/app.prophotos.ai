const path = require("path");
const DOMAIN = 'https://api.astria.ai';
const API_KEY = 'sd_qQGvqK48YTDmMT68knUsgrQSDPM7jD';
const fetch = require("node-fetch");
const { json } = require("express");

const showTune = (req, res) => {
  let options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  };
  fetch(DOMAIN + '/tunes/' + req.params.id, options).then(r => {
    return r.json();
  }).then(jsonResponse => {
    console.log(typeof(jsonResponse));
    return res.render(__dirname + '/../views/gallery.html', { ...jsonResponse });
  });
};

module.exports = {
  showTune: showTune
};