//Import all required modules
const express = require('express');
const path = require('path');

// Initialize express app
const app = express();

// Import routers
const {indexPage, place, book, pay, login, signup, signin, account, forgot, recover, home, logout, savepayment, search, about} = require('./routes/router');

const port = 7300;

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // parse form data client
app.use(express.static(path.join(__dirname, '/'))); // configure express to use public folder

// Routes for the app
app.get('/', indexPage); // Route for loading the front page.
app.get('/place', place); // Route for displaying a place.
app.get('/book', book); // Route for booking payment page.
app.post('/payment', pay); // Route for processing payment.
app.get('/login', login); // Route for login page.
app.get('/signup', signup); // Route for signup page.
app.post('/signin', signin); // Route for processing login.
app.post('/account', account); // Route for processing signup.
app.get('/forgot', forgot); // Route for forgot page.
app.post('/recover', recover); // Route for processing forgot page.
app.post('/savepayment', savepayment); // Route for saving payment to database
app.get('/search', search); // Route for searching locations
app.get('/home', home); // Route for fetching home landing page
app.get('/logout', logout); // Route for loggging out user
app.get('/about', about); // Route for about page.

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

