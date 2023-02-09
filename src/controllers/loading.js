const config = require('../config/config');
const { json } = require("express");
const listModel = require('../models/list');
const FormData = require('form-data');
const fs = require('fs');
const fetch = require("node-fetch");

const getRecord = async (req, res) => {
  const rows = await listModel.find({_id: req.params.id});
  const row = rows[0];
  console.log(row['request_id']);
  if (row['request_id'] !== undefined) {
    console.log('exists');
    return res.redirect('/gallery/' + row['request_id']);
  } else {
    console.log('no exists');
    return res.render(__dirname + '/../views/loading.html', { id: req.params.id });
  }
};

const sendRequest = (req, res) => {
  listModel.findOne({_id: req.params.id}, function(err, row) {
    let formData = new FormData();
    formData.append('tune[title]', 'My Tune');
    formData.append('tune[branch]', 'sd15');
    formData.append('tune[token]', 'sks');
    formData.append('tune[name]', 'man');
    
    row.images.forEach(image => {
      formData.append('tune[images][]', fs.createReadStream(`upload/${image}`), image);
    });
    formData.append('tune[callback]', 'https://optional-callback-url.com/to-your-service-when-ready');
    
    let options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.API_KEY}`
      },
      body: formData
    };
    fetch(config.DOMAIN + '/tunes', options).then(r => {
      return r.json();
    }).then(jsonResponse => {
      console.log(jsonResponse);
      row.request_id = jsonResponse.id;
      row.urls = jsonResponse.orig_images;
      row.save();
      return res.send(`${jsonResponse.id}`);
    });
  });
}


module.exports = {
  getRecord: getRecord,
  sendRequest: sendRequest,
};