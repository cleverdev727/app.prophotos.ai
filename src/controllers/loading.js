const config = require('../config/config');
const { json } = require("express");
const listModel = require('../models/list');
const FormData = require('form-data');
const fs = require('fs');
const fetch = require("node-fetch");

const promptsNum = 10;

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
  if (row.prompt === promptsNum - 1) {
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
        'sks person professional portrait, symmetrical face, headshot,intricate,elegant,highly detailed,8k, sharp focus, studio lighting, photo realistic style, full color, successful, professional',
        'A studio portrait of sks person wearing a peacoat, Wide Angle, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality',
        'A studio portrait of sks person wearing a blazer, headshot, intricate, elegant, HDR, UHD, 64k, highly detailed, studio lighting, professional, sharp focus, highest quality, trending on pinterest, Photograph by Ansel Adams',
        'RAW photo, a close up portrait photo of sks person, background is city ruins, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3',
        'RAW photo, a close up professional portrait photo of sks person, background is an office, wearing a blazer, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3',
        'RAW photo, a close up professional portrait photo of sks person, background is office, wearing a suit, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3',
        'RAW photo, a close up professional portrait photo of sks person, background is a photo studio, wearing a blazer, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3',
        'RAW photo, a close up professional portrait photo of sks person, background is a photo studio, wearing a peacoat, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3',
        'RAW photo, a close up professional portrait photo of sks person, background is Central Park, wearing a suit, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3',
        'Professional Portrait Eye-Level Photo From Below of sks person wearing a professional clothes, Shot on Afga Vista 400, studio lighting, in a photo studio',
      ];

      const negativePrompt = '(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck';

      for (let i = 0; i < promptsNum; i ++) {
        let promptFormData = new FormData();
        promptFormData.append('prompt[text]', texts[i]);
        promptFormData.append('prompt[negative_prompt]', negativePrompt);
        promptFormData.append('prompt[num_images]', 8);
        promptFormData.append('prompt[callback]', 'http://app.prophotos.ai/created-prompt/' + req.params.id);
        options.body = promptFormData;

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