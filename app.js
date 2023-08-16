// Pseudo Code
// 1. Receive "start" text from user
// 2. Site retrieves border wait times
// 3. Site responds with border wait times every 10min until user texts stop

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv');
dotenv.config();

// Imports from other files
const getCurrentDateAndTimeParts = require('./public/js/common');
const smsHandler = require('./public/js/modules/smsHandler'); // A module for sending SMS
const xmlHandler = require('./public/js/modules/xmlHandler'); // A module for handling XML data

xmlHandler.main();

// ********************************************************************************************************

// Init app
const app = express();

// Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index route
app.get('/', (req, res) => {
    res.render('index');
})

// Catch form submit
const styleGood = 'background-color: green; color: white; font-style: italic; border: 5px solid black; font-size: 2em;'
console.log('%cInside app.post', styleGood);
app.post('/', (req, res) => {

    res.send(req.body);
    console.log(req.body);

    const number = req.body.number;
    const text = outgoingMsgText;
    // const text = req.body.text;

    console.log('%cHERE', styleGood);
    console.log(number + '%cHERE' + text);
    console.log('\x1b[48;5;40m\x1b[38;5;226mLast line of \'app.post\'\x1b[0m');

    // ***********************************************************************************
    // ********** UNcomment the line below to receive texts again while testing **********
    // ***********************************************************************************
    // sendSMS(number, text);
})

// Define port
const port = 3000;
const { datePart, timePart } = getCurrentDateAndTimeParts();
const server = app.listen(port, () => {
    console.log(`Listening at port ${port} on \x1b[41m${datePart}\x1b[0m at \x1b[41m${timePart}\x1b[0m.`);
});


console.log(`Last line of ${__filename}`);