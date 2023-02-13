const config = require('../config/config');
const { json } = require("express");
const listModel = require('../models/list');
const FormData = require('form-data');
const fs = require('fs');
const fetch = require("node-fetch");

const getRecord = async (req, res) => {
  const rows = await listModel.find({_id: req.params.id});
  const row = rows[0];
  if (row['request_id'] !== undefined) {
    return res.redirect('/gallery/' + row['request_id']);
  } else {
    return res.render(__dirname + '/../views/loading.html', { id: req.params.id });
  }
};

const createdTune = (req) => {
  console.log('callback here');
  console.log(req.params);
  listModel.findOneAndUpdate(
    {_id: req.params.id},
    {status: true}
  );
  req.app.get('io').emit('created-tune', 'tune created successfully');
}

const createdPrompt = async (req) => {
  console.log('prompt callback here');
  console.log(req.params);
  const row = await listModel.findOneAndUpdate(
    {_id: req.params.id},
    {
      $inc: {
        prompt: 1
      }
    }
  );
  if (row.prompt === 9) {
    req.app.get('io').emit('created-all-prompt', row.request_id);
  }
}

const sendRequest = (req, res) => {
  console.log('trying to send');
  listModel.findOne({_id: req.params.id}, function(err, row) {
    let formData = new FormData();
    formData.append('tune[title]', 'My Tune');
    formData.append('tune[branch]', 'sd15');
    formData.append('tune[token]', 'sks');
    formData.append('tune[name]', 'person');
    
    row.images.forEach(image => {
      formData.append('tune[images][]', fs.createReadStream(`upload/${image}`), image);
    });
    formData.append('tune[callback]', 'http://app.prophotos.ai/created-tune/' + req.params.id);
    
    let options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.API_KEY}`
      },
      body: formData
    };
    console.log('ready to send');
    fetch(config.DOMAIN + '/tunes', options).then(r => {
      return r.json();
    }).then(jsonResponse => {
      // createdTune(req);
      console.log('end request');
      console.log(jsonResponse);
      row.request_id = jsonResponse.id;
      row.urls = jsonResponse.orig_images;
      row.save();

      const texts = [
        'A studio portrait of sks person wearing a peacoat, Wide Angle, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality, trending on Pinterest, Photograph by Peter Kemp',
        'A studio portrait of sks person wearing a peacoat, Wide Angle, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality',
        'A studio portrait of sks person wearing a peacoat, Wide Angle, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality, trending on Pinterest, bokeh, outdoors, Photograph by Ruth Bernhard',
        'A studio portrait of sks person wearing a Tom Ford suit and tie, headshot, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality, trending on Pinterest',
        'A studio portrait of sks person wearing a peacoat, Wide Angle, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality, trending on Pinterest, bokeh, Photograph by Ruth Bernhard',
        'A studio portrait of sks person wearing a blazer, headshot, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality, trending on pinterest, Photograph by Ansel Adams',
        'A studio portrait of sks person wearing Aime Leon Dore, headshot, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality, trending on pinterest, Photograph by Ansel Adams',
        'A studio portrait of sks person wearing a blazer, headshot, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality, trending on pinterest, Photograph by Ansel Adams',
        'sks person portrait wearing suit and tie, symmetrical face, headshot,intricate,elegant,highly detailed,8k, sharp focus, studio lighting, photo realistic style, color, successful, professional, corporate, from investor prospectus',
        'sks person portrait, symmetrical face, headshot,intricate,elegant,highly detailed,8k, sharp focus, studio lighting, photo realistic style, full color, successful, professional'
      ];

      for (let i = 0; i < 10; i ++) {
        let promptFormData = new FormData();
        promptFormData.append('prompt[text]', texts[i]);
        promptFormData.append('prompt[num_images]', 8);
        // promptFormData.append('prompt[negative_prompt]', 'extra leg');
        // promptFormData.append('prompt[super_resolution]', 'true');
        // promptFormData.append('prompt[face_correct]', 'true');
        promptFormData.append('prompt[callback]', 'http://app.prophotos.ai/created-prompt/' + req.params.id);
        options.body = promptFormData;
        // options.body = {
        //   'prompt[text]': texts[i],
        //   'prompt[num_images]': 8,
        //   'prompt[negative_prompt]': 'extra leg',
        //   'prompt[super_resolution]': true,
        //   'prompt[face_correct]': true,
        //   'prompt[callback]': 'http://app.prophotos.ai/created-prompt/' + req.params.id
        // };
        // console.log(options);
        console.log(config.DOMAIN + '/tunes/' + jsonResponse.id + '/prompts');
        fetch(config.DOMAIN + '/tunes/' + jsonResponse.id + '/prompts', options).then(promptR => {
          return promptR.json();
        }).then(promptJson => {
          console.log(promptJson);
          console.log(i);
          // createdPrompt(req);
        });
      }

      return res.send(`${jsonResponse.id}`);
    });
  });
}


module.exports = {
  getRecord: getRecord,
  sendRequest: sendRequest,
  createdTune: createdTune,
  createdPrompt: createdPrompt,
};