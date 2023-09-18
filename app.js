console.log(`1st line of \x1b[41m${__filename}\x1b[0m`);
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
// const mainAsWell = require('./public/js/main');
const smsHandler = require('./public/js/modules/smsHandler'); // A module for sending SMS
console.log(`Still in \x1b[41m${__filename}\x1b[0m`);
const xmlHandler = require('./public/js/modules/xmlHandler'); // A module for handling XML data

// const outgoingMsgText = xmlHandler.borderData();
const { datePart, timePart } = getCurrentDateAndTimeParts();
console.log(`\x1b[41m${datePart}\x1b[0m at \x1b[41m${timePart}\x1b[0m.`);

// ********************************************************************************************************

// Init app
const app = express();
console.log(`Still in \x1b[41m${__filename}\x1b[0m`);

// From ChatGPT
app.get('/api/data', async (req, res) => { // Use async to await the promise
    try {
        let borderData = await xmlHandler.borderData(); // Await the promise
        // let borderData = await xmlHandler.borderData(); // Await the promise
        const { datePart, timePart } = getCurrentDateAndTimeParts();
        let messageHtml = `${datePart} at ${timePart}` + borderData.split('\n').join('<br>');
        let messageConsole = `${datePart} at ${timePart}` + borderData;
        const data = {
            messageHtml,
            messageConsole,
        };
        res.json(data);
    } catch (error) {
        // Handle any errors that occur during the asynchronous operation
        console.error('Error in /api/data:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

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
    console.log(`\x1b[41mInside app.get '/'. You should see this message when the page (re)loads\x1b[0m`);
})

// Catch form submit
const styleGood = 'background-color: green; color: white; font-style: italic; border: 5px solid black; font-size: 2em;'
console.log(`\x1b[41mInside app.post\x1b[0m`);

app.post('/', (req, res) => {

    res.send(req.body);
    console.log(`Just hit "SEND TEXT" button`); // Log to terminal
    console.log(req.body); // Log to terminal

    const number = req.body.number;
    // const text = outgoingMsgText;
    const text = req.body.text;

    console.log('%cHERE', styleGood); // Log to terminal
    console.log(number + '%cHERE' + text); // Log to terminal
    console.log('\x1b[48;5;40m\x1b[38;5;226mRandy\x1b[0m'); // Log to terminal

    // ***********************************************************************************
    // ********** UNcomment the line below to receive texts again while testing **********
    // ***********************************************************************************
    // sendSMS(number, text);
})

// Configure your web application to receive HTTP POST requests and respond with TwiML
app.post('/webhook', async (req, res) => {
    // Get the message from the request body
    const message = req.body.Body;

    let messageHtml = '';
    let messageConsole = '';
    // Ping your website and extract the status message
    // const statusMessage = await pingWebsiteAndExtractMessage();
    try {
        let borderData = await xmlHandler.borderData(); // Await the promise
        // let borderData = await xmlHandler.borderData(); // Await the promise
        const { datePart, timePart } = getCurrentDateAndTimeParts();
        messageHtml = `${datePart} at ${timePart}` + borderData.split('\n').join('<br>');
        messageConsole = `\n${datePart} at ${timePart}` + borderData;
        // const data = {
        //     messageHtml,
        //     messageConsole,
        // };
        // console.log(`messageHtml = ${messageHtml}`); // Log to terminal
        // console.log(`messageConsole = ${messageConsole}`); // Log to terminal
        // res.json(data);
    } catch (error) {
        // Handle any errors that occur during the asynchronous operation
        console.error('Error in /api/data:', error);
        res.status(500).json({ error: 'An error occurred' });
    }

    // Respond to Twilio with a TwiML message that contains the status message
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Message>
      Border Xing times from CAN to USA:${messageConsole}
    </Message>
  </Response>`);
});

// Define port
const port = 3000;
const server = app.listen(port, () => {
    const { datePart, timePart } = getCurrentDateAndTimeParts();
    console.log(`Listening at port ${port} on \x1b[41m${datePart}\x1b[0m at \x1b[41m${timePart}\x1b[0m.`); // Log to terminal
});


console.log(`Last line of \x1b[41m${__filename}\x1b[0m`); // Log to terminal