const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const twilio = require('twilio');
const socketio = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();

// ********************************************************************************************************
const axios = require('axios');
const parseString = require('xml2js').parseString;

const xmlUrl = 'https://bwt.cbp.gov/api/bwtrss/getAllPortsRss/Canada';

async function fetchXMLData() {
    try {
        const response = await axios.get(xmlUrl);
        const xmlData = response.data;
        return xmlData;
    } catch (error) {
        console.error('Error fetching XML data:', error);
        return null;
    }
}

async function parseXMLAndExtractInfo(xmlData) {
    if (!xmlData) {
        console.log('No XML data available.');
        return;
    }

    parseString(xmlData, (err, result) => {
        if (err) {
            console.error('Error parsing XML:', err);
            return;
        }

        const items = result.rss.channel[0].item;

        items.forEach(item => {
            const title = item.title[0];
            const description = item.description[0];
            // const passengerVehiclesInfo = item.description[0];

            if (title === "Blaine - Pacific Highway" || title === "Blaine - Peace Arch" || title === "Blaine - Point Roberts" || title === "Lynden" || title === "Sumas") {

                if (description !== null && description !== undefined) {
                    // *********************************
                    // *********************************
                    const description2 = description._;
                    const regex = /Maximum Lanes:(.*?)Maximum Lanes:(.*?)Nexus Lanes:/s;
                    const match = description2.match(regex);

                    if (match && match[2]) {
                        const extractedText = match[2].trim();
                        // console.log('extractedText =');
                        console.log(`\x1b[48;5;40m\x1b[38;5;226m${title}: ${extractedText}\x1b[0m`);
                    } else {
                        console.log("Text not found.");
                    }

                    // *********************************
                    // *********************************
                } else {
                    console.log('If statement was FALSE.');
                }

            }
        });
    });
}

async function main() {
    const xmlData = await fetchXMLData();
    parseXMLAndExtractInfo(xmlData);
}

main();

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
    const text = req.body.text;

    console.log('%cHERE', styleGood);
    console.log(number + '%cHERE' + text);
    console.log('\x1b[48;5;40m\x1b[38;5;226mLast line of \'app.post\'\x1b[0m');

    // ***********************************************************************************
    // ********** UNcomment the line below to receive texts again while testing **********
    // ***********************************************************************************
    // sendSMS(number, text);
})

console.log('\x1b[31;42;1;4m31 = Red font; 1 = Bold font; 4 = underlined font; \x1b[0m');
console.log('\x1b[31;4;42mHello\x1b[0m');
console.log('\x1b[38;5;206mHello\x1b[0m');
console.log('\x1b[48;5;57mHello\x1b[0m');
console.log('\x1b[38;5;206;48;5;57mHello\x1b[0m');
console.log('\x1b[38;2;255;82;197;48;2;155;106;0mHello\x1b[0m');



// Define port
const port = 3000;

const date = new Date();
const formattedDate = date.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const [datePart, timePart] = formattedDate.split(', ');
console.log(`datePart = ${datePart}`);
console.log(`timePart = ${timePart}`);


const server = app.listen(port, () => {
    console.log(`Listening at port ${port} on \x1b[48;5;40m\x1b[38;5;226m${datePart}\x1b[0m at \x1b[48;5;40m\x1b[38;5;226m${timePart}\x1b[0m.`);
});


// Functions
function sendSMS(number, text) {
    console.log('Inside sendSMS function');
    console.log(`Args 'number' = ${number}, & 'text' = ${text}.`);
    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    return client.messages
        .create({ body: `\nThe number sent over was ${number}, & the message sent was ${text}.`, from: '+18449302025', to: process.env.PHONE_NUMBER })
        // .create({ body: `Hey, this is a message on ${datePart} at ${timePart}.`, from: '+18449302025', to: process.env.PHONE_NUMBER })
        .then(message => console.log(message, 'Message sent.'))
        .catch(err => console.log(err, 'Message NOT sent.'));
}
