const { readFileSync } = require("fs");
const fs = require('fs');
const { resolve } = require('path'); // Import path finder
var request = require('request');
const { client, environment } = require('square');
require("dotenv").config();  // Environment event handler

let dataroute = resolve('./routes/json/data.json');

// Get videos list
const placesdata = readFileSync(
    dataroute,
    "utf-8"
    );

module.exports = {

    // Object function to load front page.
    indexPage: async (req, res) => {

    try {

        let json = JSON.parse(placesdata);

        let placesFound = json.body.places;

        res.render('home.ejs', {
            title: " ",
            message: '',
            places:placesFound
        });
      
    } catch (error) {
          console.error(`Request failed: ${error}`);
    }

    },

    // Object function to watch a video
    place: (req, res) => {

        // Get video id
        var id = req.query.id;

        let json = JSON.parse(placesdata);

        let destinations = json.body.places;

        let destinationId;
        let destinationName;
        let destinationURL;
        let destinationPoster;
        let destinationDescription;
        let destinationPrice;

        destinations.forEach(e => {
            if(e.id==id){
                destinationId = e.id;
                destinationName = e.file_name;
                destinationURL = e.playback_uri;
                destinationPoster = e.poster;
                destinationDescription = e.description;
                destinationPrice = e.price;
            } 
        });

        if(destinationId && destinationName && destinationURL && destinationPoster && destinationDescription && destinationPrice){
        res.render('place.ejs', {
            title: " ",
            message: '',
            destinationId: destinationId,
            destinationName: destinationName,
            destinationURL: destinationURL,
            destinationPoster: destinationPoster,
            destinationDescription: destinationDescription,
            destinationPrice: destinationPrice
        }); 
        } else {
            res.redirect('/');
        }

    },

    // Object function to load upload page
    upload: (req, res) => {
        res.render('upload.ejs', {
            title: " "
            ,message: ''
        });
    },

    // Object function to upload a video 
    autoupload: (req, res) => {

        const {medianame, text} = req.body;

        console.log(0)

        // In case there's a file in the form
        if (req.files) {

        // Capture file from form data
        const uploadedFile = req.files.file;
            
        // Give file new name
        let file_name = uploadedFile.name;

        let videoname = ((Math.random())*9999999999)+'_'+((Math.random())*9999999999);

        let extRegex = /\.[0-9a-z]+(?:-[0-9a-z]+)*$/i
        let uploadExtension = file_name.match(extRegex)[0]

        file_name = videoname + uploadExtension;    // Give file new name

        console.log(1)

        // Identify video file extension
        if ((uploadedFile.mimetype === 'video/mp4' || uploadedFile.mimetype === 'video/mov' || uploadedFile.mimetype === 'video/f4v' || uploadedFile.mimetype === 'video/m4b' || uploadedFile.mimetype === 'video/webm' || uploadedFile.mimetype === 'video/ogg' || uploadedFile.mimetype === 'video/mpeg' || uploadedFile.mimetype === 'video/mp2t') && uploadedFile.size < 48000000) {

        console.log(2)

        var optionsURL = {
            'method': 'POST',
            'url': 'https://api.thetavideoapi.com/upload',
            'headers': {
              'x-tva-sa-id': 'srvacc_13276wt681aczeh0xys067gz1',
              'x-tva-sa-secret': '4ucqfwvzve8mnmxxz0rmzjb2dr2nyqmv'
            }
        };
        
        request(optionsURL, function (errorURL, responseURL) {
          
            if (errorURL) {

                console.log(errorURL)
              res.status(200).json({"upload": 0})
            } else {

                console.log(3)
          
              let upload_api = JSON.parse(responseURL.body); // Get id: upload_api.body.uploads[0].id // Get Presigned URL: upload_api.body.uploads[0].presigned_url
          
              var optionsUpload = {
                'method': 'PUT',
                'url': `${upload_api.body.uploads[0].presigned_url}`,
                'headers': {
                  'Content-Type': 'application/octet-stream'
                },
                body: `${uploadedFile}`
              };
          
              request(optionsUpload, function (errorUpload, responseUpload) {
                if (errorUpload) {

                  console.log(errorUpload);

                  res.status(200).json({"upload": 0})
                } else {

                  console.log(responseUpload);

                  // If upload is successful
                  res.status(200).json({"upload": 1})
                  
                }                
              });
          
            }
            
        }); 
        
        // If Video is not a video, don't upload it
        } else {
          console.log(01)
          res.status(200).json({"upload": 0})
        }

        // If No file uploaded, then do not upload anything
        } else {
          console.log(02)
          res.status(200).json({"upload": 0})
        }

    },

    // Object function to load front page.
    search: async (req, res) => {

    try {

        let json = JSON.parse(placesdata);

        let placesFound = json.body.places;

        res.render('search.ejs', {
            title: " ",
            message: '',
            places: placesFound
        });
      
    } catch (error) {
          console.error(`Request failed: ${error}`);
    }

    },

    // Object function to load booking page
    book: (req, res) => {

        // Get video id
        var id = req.query.id;

        let json = JSON.parse(placesdata);

        let destinations = json.body.places;

        let destinationId;
        let destinationName;
        let destinationURL;
        let destinationPoster;
        let destinationDescription;
        let destinationPrice;
        let destinationFee;

        destinations.forEach(e => {
            if(e.id==id){
                destinationId = e.id;
                destinationName = e.file_name;
                destinationURL = e.playback_uri;
                destinationPoster = e.poster;
                destinationDescription = e.description;
                destinationPrice = e.price;
                destinationFee = e.fee;
            } 
        });

        if(destinationId && destinationName && destinationURL && destinationPoster && destinationDescription && destinationPrice && destinationFee){
        res.render('book.ejs', {
            title: " ",
            message: '',
            destinationId: destinationId,
            destinationName: destinationName,
            destinationURL: destinationURL,
            destinationPoster: destinationPoster,
            destinationDescription: destinationDescription,
            destinationPrice: destinationPrice,
            destinationFee: destinationFee
        }); 
        } else {
            res.redirect('/');
        }

    },     

    // Object function to process payments
    pay: async (req, res) => {

      const {days, people, fee} = req.body;

      console.log(days);
      console.log(people);
      console.log(fee);

      try {
        const response = await client.paymentsApi.createPayment({
          sourceId: 'cnon:card-nonce-ok',
          idempotencyKey: '80fdcc6f-cba6-4247-a23a-1d901dc7f9d4',
          amountMoney: {
            amount: `${fee}`,
            currency: 'USD'
          }
        });

        console.log(response.result);

        res.render('home.ejs', {
          title: " ",
          message: '',
          places: placesFound
        });

      } catch(error) {
        console.log(error);
      }

    },     

    // Object function to load about page
    about: (req, res) => {
        res.render('about.ejs', {
            title: " "
            ,message: ''
        });
    },     

};

