const getCurrentDateAndTimeParts = require('./public/js/common');
const { datePart, timePart } = getCurrentDateAndTimeParts();

console.log(`\x1b[45m*********************************************************************************\x1b[41m${datePart}\x1b[45m at \x1b[41m${timePart}\x1b[45m*********************************************************************************\x1b[0m`);

const http = require('http');
// const googleMapsAPI = require('@google-maps-platform/client');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// Fetch the JSON file.
const fs = require('fs');

// Read the JSON file from the filesystem.
const jsonData = fs.readFileSync('./borderXings.json');

// Parse the JSON file into a JavaScript object.
const data = JSON.parse(jsonData);
// console.log(data);

const destination = '3809+Alabama+St,+Bellingham,+WA+98226-4585';

const whichBound = (/Canada/i).test(destination) ? "northbound" : "southbound";
console.log(`\x1b[41mwhichBound = ${whichBound}\x1b[0m`);

// Filter out the entries that are not `whichBound`.
const whichBoundEntries = data.filter(entry => entry.direction === whichBound);

// Extract the `plusCode` info from the remaining entries.
// const originPlusCodesAndNicknames = whichBoundEntries.map(entry => ({
//     plusCode: entry.plusCode,
//     nickname: entry.nickname,
// }));

// // Display the `plusCode` info to the console.
// console.log(`\x1b[41moriginPlusCodesAndNicknames = ${originPlusCodesAndNicknames}\x1b[0m`);
// console.log(originPlusCodesAndNicknames);

const main = async () => {
    console.log(`\x1b[42mInside 'main\x1b[0m'`);
    const sortedTravelTimes = await getShortestTravelTimes();
    await outputResults(sortedTravelTimes);
};

const getShortestTravelTimes = async () => {
    console.log(`\x1b[44mInside 'getShortestTravelTimes'\x1b[0m`);
    console.log(`whichBoundEntries =`);
    console.log(whichBoundEntries);
    console.log(borderToDestination);
    const travelTimes = await Promise.all(whichBoundEntries.map(borderToDestination));

    console.log(`Below travelTimes`);
    console.log(whichBoundEntries);

    console.log(`travelTimes = ${travelTimes}`);
    const sortedTravelTimes = travelTimes.sort((a, b) => a - b);
    console.log(`**********************sortedTravelTimes = ${sortedTravelTimes}`);

    return sortedTravelTimes;
};

// Get travel info from external website
const borderToDestination = async (origin) => {
    console.log(`Inside 'borderToDestination'`);
    // console.log(`origin =`);
    // console.log(whichBoundEntries);
    console.log(`\x1b[44morigin = ${origin.plusCode}\x1b[0m`); // BLUE text
    console.log(`\x1b[45morigin.nickname = ${origin.nickname}\x1b[0m`);

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.plusCode}&destination=${destination}&key=${apiKey}`;

    const response = await axios.get(url);

    origin.timeToDestination = response.data.routes[0].legs[0].duration.text.split(' ')[0];
    origin.distanceToDestination = response.data.routes[0].legs[0].distance.text.split(' ')[0];

    console.log(`${response.data.routes[0].legs[0].duration.text.split(' ')[0]}min to get the ${response.data.routes[0].legs[0].distance.text.split(' ')[0]}mi from ${origin.nickname} to home.`);
    console.log(`origin =`);
    console.log(origin);

    return origin;
};

const outputResults = async (sortedTravelTimes) => {
    // Output the results to the terminal window.
    console.log('Shortest travel times from each origin to destination:');
    for (const travelTime of sortedTravelTimes) {
        console.log(`${travelTime} min from XXXXXX ( miles) -> Home`);
    }

    // Output the results to a webpage.
    const httpServer = http.createServer((req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.write(`<h1>Shortest travel times from each origin to destination</h1><ul>`);

        for (const travelTime of sortedTravelTimes) {
            res.write(`<li>${travelTime} min from XXXXXX ( miles) -> Home</li>`);
        }

        res.write(`</ul>`);
        res.end();
    });

    httpServer.listen(3000, () => {
        console.log(`\x1b[45m****************************************************************Webpage listening on port 3000 on \x1b[41m${datePart}\x1b[45m at \x1b[41m${timePart}\x1b[45m****************************************************************\x1b[0m`);
    });
};

// // Create a lookup table of nickname to plusCode pairs.
// const nicknameToPlusCodeLookup = jsonData.reduce((lookup, entry) => {
//     lookup[entry.nickname] = entry.plusCode;
//     return lookup;
// }, {});

// const lookupNickname = (plusCode) => {
//     return nicknameToPlusCodeLookup[plusCode];
// };

main();

// Peace Arch -> Home
// https://maps.googleapis.com/maps/api/directions/json?origin=262W%2B32,+Blaine,+WA&destination=3809+Alabama+St,+Bellingham,+WA+98226-4585&key=AIzaSyCjaHm6AHGIH7x-Tx_S-y2Hv5xadsxxcqI