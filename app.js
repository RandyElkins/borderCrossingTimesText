console.log(`1st line of \x1b[41m${__filename}\x1b[0m`); // RED background with BLACK font
// Pseudo Code
// 1. Receive "start" text from user
// 2. Site retrieves border wait times
// 3. Site responds with border wait times every 10min until user texts stop

// Useful sites
// https://bwt.cbp.gov/ // Border wait times: Canada/Mexico to USA
// https://www.ezbordercrossing.com/list-of-border-crossings/ // Lists ALL xings between USA & Canada
// https://cbsa-asfc.gc.ca/bwt-taf/menu-eng.html#s1 // Border wait times: USA to Canada
// https://canadabordertimes.com/
// https://borderlineups.com/wait-times/

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv');
dotenv.config();

// Imports from other files
const { getCurrentDateAndTimeParts, getBorderXingJsonData, convertToMinutes } = require('./public/js/common');
// const mainAsWell = require('./public/js/main');
const smsHandler = require('./public/js/modules/smsHandler'); // A module for sending SMS
console.log(`Still in \x1b[41m${__filename}\x1b[0m`); // RED background with BLACK font
const xmlHandler = require('./public/js/modules/xmlHandler'); // A module for handling XML data
const { getToFromBorderInfo } = require('./public/js/modules/toFromBorder'); // A module for handling XML data

const { datePart, timePart } = getCurrentDateAndTimeParts();
console.log(`\x1b[41m${datePart}\x1b[0m at \x1b[41m${timePart}\x1b[0m.`); // RED background with BLACK font
let data = getBorderXingJsonData();
// console.log(`\x1b[44mdata2 =`);
// console.log(data);
// console.log(`\x1b[0m`);
const origination = 'Tatlow Walk, Vancouver, BC V6G 3E2, Canada';
const destination = '3809+Alabama+St+98226'; // Only street & zip needed
// const destination = '3809+Alabama+St,+Bellingham,+WA+98226-4585';
const directionNS = (/Canada/i).test(destination) ? "northbound" : "southbound";

const info = {
    origination,
    destination,
    directionNS
}
// ********************************************************************************************************

// Init app
const app = express();
console.log(`Still in \x1b[41m${__filename}\x1b[0m`); // RED background with BLACK font

// From ChatGPT
app.get('/api/data', async (req, res) => { // Use async to await the promise
    // console.log(`\x1b[44mInside ${__filename} /api/data, data\x1b[41m1\x1b[44m =`);
    // console.log(data);
    // console.log(`\x1b[0m`);

    // Get current Origination-to-Border-to-Destination-Data (Time & Distance)
    try {
        // console.log(`\x1b[41mInside ${__filename} /api/data, data =`);
        // console.log(data);
        // console.log(`\x1b[0m`);
        data = await getToFromBorderInfo(data, info);
        data = await xmlHandler.canadaToUsBorderData(data, info);
        // console.log(`\x1b[42mInside ${__filename} /api/data, data =`);
        // console.log(data);
        // console.log(`\x1b[0m`);

        const { datePart, timePart } = getCurrentDateAndTimeParts();
        let messageHtml = `${datePart} at ${timePart}`;
        // let messageHtml = `${datePart} at ${timePart}` + canadaToUsBorderData.split('\n').join('<br>');
        // let messageHtml = `<span class="date-time">${datePart} at ${timePart}</span>`;
        // canadaToUsBorderData.split('\n').forEach((line, index) => {
        //     messageHtml += `<span class="border-data${index + 1}">${line}</span>`;
        // });

        // Canada-to-US
        const messageHtmlCanadaToUsTableHeader = `<table>
        <thead>
            <tr>
                <th class="canadaToUsTimes">Southbound (<span class="canada">Canada</span> to <span class="usa">US</span>) on ${datePart} at ${timePart}</th>
            </tr>
        </thead>`

        let messageHtmlCanadaToUsTableBody = "";
        // canadaToUsBorderData.split('\n').forEach((line, index) => {
        //     messageHtmlCanadaToUsTableBody += `<tr><td>${line}</td></tr>`;
        // });

        const messageHtmlCanadaToUsTableTotal = messageHtmlCanadaToUsTableHeader + messageHtmlCanadaToUsTableBody + `</tbody></table>`;


        // US-to-Canada
        const messageHtmlUsToCanadaTableHeader = `<table>
        <thead>
            <tr>
                <th class="usToCanadaTimes">Northbound (<span class="usa">US</span> to <span class="canada">Canada</span>) on ${datePart} at ${timePart}</th>
            </tr>
        </thead>`

        let messageHtmlUsToCanadaTableBody = "";
        // canadaToUsBorderData.split('\n').forEach((line, index) => {
        //     messageHtmlUsToCanadaTableBody += `<tr><td>${line}</td></tr>`;
        // });

        const messageHtmlUsToCanadaTableTotal = messageHtmlUsToCanadaTableHeader + messageHtmlUsToCanadaTableBody + `</tbody></table>`;


        // let messageConsole = `${datePart} at ${timePart}` + canadaToUsBorderData;
        // const data = {
        //     messageHtml,
        //     messageHtmlCanadaToUsTableTotal,
        //     messageHtmlUsToCanadaTableTotal,
        //     messageConsole,
        // };
        res.json(data);

        // return data;
    } catch (error) {
        console.error('Error in toFromBorder.js', error);
        res.status(500).json({ error: 'An error occurred' });
    }

    console.log(`Final times here!!`);
    // console.log(`\x1b[41mInside ${__filename} /api/data, data =`);
    // console.log(data);
    // console.log(`\x1b[0m`);

    // Get current Border Times
    // try {
    //     console.log(`\x1b[44mInside ${__filename} /api/data, Do we have data =`);
    //     console.log(data);
    //     console.log(`\x1b[0m`);
    //     let canadaToUsBorderData = await xmlHandler.canadaToUsBorderData(data); // Await the promise
    //     console.log(`\x1b[44mInside ${__filename} /api/data, canadaToUsBorderData =`);
    //     console.log(`${canadaToUsBorderData}`);
    //     console.log(`\x1b[0m`);
    //     // let usToCanadaBorderData = await xmlHandler.usToCanadaBorderData(); // Await the promise
    //     const { datePart, timePart } = getCurrentDateAndTimeParts();
    //     let messageHtml = `${datePart} at ${timePart}` + canadaToUsBorderData.split('\n').join('<br>');
    //     // let messageHtml = `<span class="date-time">${datePart} at ${timePart}</span>`;
    //     canadaToUsBorderData.split('\n').forEach((line, index) => {
    //         messageHtml += `<span class="border-data${index + 1}">${line}</span>`;
    //     });

    //     // Canada-to-US
    //     const messageHtmlCanadaToUsTableHeader = `<table>
    //     <thead>
    //         <tr>
    //             <th class="canadaToUsTimes">Southbound (<span class="canada">Canada</span> to <span class="usa">US</span>) on ${datePart} at ${timePart}</th>
    //         </tr>
    //     </thead>`

    //     let messageHtmlCanadaToUsTableBody = "";
    //     canadaToUsBorderData.split('\n').forEach((line, index) => {
    //         messageHtmlCanadaToUsTableBody += `<tr><td>${line}</td></tr>`;
    //     });

    //     const messageHtmlCanadaToUsTableTotal = messageHtmlCanadaToUsTableHeader + messageHtmlCanadaToUsTableBody + `</tbody></table>`;


    //     // US-to-Canada
    //     const messageHtmlUsToCanadaTableHeader = `<table>
    //     <thead>
    //         <tr>
    //             <th class="usToCanadaTimes">Northbound (<span class="usa">US</span> to <span class="canada">Canada</span>) on ${datePart} at ${timePart}</th>
    //         </tr>
    //     </thead>`

    //     let messageHtmlUsToCanadaTableBody = "";
    //     canadaToUsBorderData.split('\n').forEach((line, index) => {
    //         messageHtmlUsToCanadaTableBody += `<tr><td>${line}</td></tr>`;
    //     });

    //     const messageHtmlUsToCanadaTableTotal = messageHtmlUsToCanadaTableHeader + messageHtmlUsToCanadaTableBody + `</tbody></table>`;


    //     let messageConsole = `${datePart} at ${timePart}` + canadaToUsBorderData;
    //     const data = {
    //         messageHtml,
    //         messageHtmlCanadaToUsTableTotal,
    //         messageHtmlUsToCanadaTableTotal,
    //         messageConsole,
    //     };
    //     res.json(data);
    // } catch (error) {
    //     // Handle any errors that occur during the asynchronous operation
    //     console.error('Error in /api/data:', error);
    //     res.status(500).json({ error: 'An error occurred' });
    // }
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
    console.log(`\x1b[41mInside app.get '/'. You should see this message when the page (re)loads\x1b[0m`); // RED background with BLACK font
})

// Catch form submit
const styleGood = 'background-color: green; color: white; font-style: italic; border: 5px solid black; font-size: 2em;'

app.post('/', (req, res) => {
    console.log(`\x1b[43mInside app.post\x1b[0m`); // RED background with BLACK font

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
        let canadaToUsBorderData = await xmlHandler.canadaToUsBorderData(); // Await the promise
        // let canadaToUsBorderData = await xmlHandler.canadaToUsBorderData(); // Await the promise
        const { datePart, timePart } = getCurrentDateAndTimeParts();
        messageHtml = `${datePart} at ${timePart}` + canadaToUsBorderData.split('\n').join('<br>');
        messageConsole = `\n${datePart} at ${timePart}` + canadaToUsBorderData;

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
    console.log(`Listening at port ${port} on \x1b[41m${datePart}\x1b[0m at \x1b[41m${timePart}\x1b[0m.`); // Log to terminal // RED background with BLACK font
});


console.log(`Last line of \x1b[41m${__filename}\x1b[0m`); // Log to terminal // RED background with BLACK font