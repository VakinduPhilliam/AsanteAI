const { readFileSync } = require("fs");
const fs = require('fs');
const { resolve } = require('path'); // Import path finder
var request = require('request');
const { v4: uuidv4 } = require('uuid');
const { Client, Databases, ID, Query, Account, Api } = require("appwrite"); // Import Appwrite NPM module
require("dotenv").config();  // Environment event handler

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // API Endpoint
    .setProject('645f349401c238199bb0'); // Appwrite project ID

// Create a new appwrite user
const account = new Account(client);

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

    // Object function to load a destination
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

    // Object function to load login page
    login: (req, res) => {
        res.render('login.ejs', {
            title: " "
            ,message: ''
        });
    },

    // Object function to load signup page
    signup: (req, res) => {
        res.render('signup.ejs', {
            title: " "
            ,message: ''
        });
    },

    // Object function to load forgot page
    forgot: (req, res) => {
        res.render('forgot.ejs', {
            title: " "
            ,message: ''
        });
    },

    // Object function to login
    signin: (req, res) => {

      const {email, password} = req.body;

      const login = account.createEmailSession(
        `${email}`,
        `${password}`
      )
      
      // Get response after account created
      login.then((response) => {
    
        res.status(200).json({"login": 1})
      
      }, (error) => {
    
        res.status(200).json({"login": 0, "reason":`${error}`})
      
      });

    },

    // Object function to create account
    account: (req, res) => {

        const {email, password, name} = req.body;

        // Register new User
        let newaccount = account.create(
          ID.unique(),
          `${email}`,
          `${password}`,
          `${name}`
        )
        
        // Get response after account created
        newaccount.then((response) => {

          res.status(200).json({"created": 1})
        
        }, (error) => {

          res.status(200).json({"created": 0, "reason":`${error}`})
        
        });

    },

    // Object function to recover password
    recover: (req, res) => {

        const {email} = req.body;

        const forgot = account.createPasswordRecovery(
          `${email}`,
          'https://example.com'
        )

        // Get Response
        forgot.then((response) => {
      
          res.status(200).json({"forgot": 1})
      
        }, (error) => {
      
          res.status(200).json({"forgot": 0, "reason":`${error}`})
      
        });
      
    },

    // Object function to load home page.
    home: async (req, res) => {

    //const userSession = account.get();

    // Get response after account created
    //userSession.then((response) => {

    try {

        const databases = new Databases(client); // Connect to database

        let fetchBookings = databases.listDocuments(
          '647251da589468fff679', // DATABASE ID
          '64725214d2a7f5219ac4', // COLLECTION ID
          [
            Query.equal('email', 'pvakindu@gmail.com')
          ]
          ); 

        let json = JSON.parse(placesdata);

        let placesFound = json.body.places;

        let myBookings = [];

        res.render('center.ejs', {
            title: " ",
            message: '',
            places: placesFound,
            bookings: myBookings
        });
      
    } catch (error) {
          console.error(`Request failed: ${error}`);
    }
  
    //}, (error) => {
      
    //  res.redirect('/login');

    //});

    },

    // Object function to logout a user
    logout: (req, res) => {

      const sessionDelete = account.deleteSession("current");

        // Get Response
        sessionDelete.then((response) => {
      
          res.redirect('/login');
      
        }, (error) => {
      
          res.redirect('/login');
      
        });
      
    },

    // Object function to save booking payment to cloud database
    savepayment: async (req, res) => {

      const { days, people, fee, name, email, startdate} = req.body;

      console.log(days);
      console.log(people);
      console.log(fee);
      console.log(name);
      console.log(email);
      console.log(startdate);

      const databases = new Databases(client); // Connect to database
      
      var date = new Date();

      let create = databases.createDocument(
        '647251da589468fff679', // DATABASE ID
        '64725214d2a7f5219ac4', // COLLECTION ID
         ID.unique(), 
         {
            'reservedBy': `${email}`,
            'email': `${email}`,
            'name': `${name}`,
            'people': `${people}`,
            'days': `${days}`,
            'amount': `${fee}`,
            'currency': 'USD',
            'startdate': `${startdate}`,
            'time': `${date}`,
         });
    
      // Get response after creating document
      
      create.then((response) => {

        console.log("Payment saved to database")
        
        res.status(200).json({"pay": 1})
      
      }, (error) => {

        console.log("Payment Failed to save")
        
        res.status(200).json({"pay": 0})
      
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

      let { Client, Environment } = require('square'); // Import Square NPM module

      const { days, people, fee, sourceId} = req.body;

      let isProduction = 'production';

      const client = new Client({
        environment: isProduction ? Environment.Production : Environment.Sandbox,
        accessToken: `${sourceId}`
      });

      try {
        const response = await client.paymentsApi.createPayment({
          sourceId: 'cnon:card-nonce-ok',
          idempotencyKey: `${uuidv4()}`,
          amountMoney: {
            amount: `${fee}`,
            currency: 'USD'
          }
        });

        console.log(response)

        res.status(200).json({"SUCCESS": true})

      } catch(error) {
        res.status(400).json({"FAILED": true})
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

