const { getCurrentDateAndTimeParts, getBorderXingJsonData, convertToMinutes } = require('../common');
const { datePart, timePart } = getCurrentDateAndTimeParts();
// Intro message to tell where the new run begins
console.log(`\x1b[45m*********************************************************************************\x1b[41m${datePart}\x1b[45m at \x1b[41m${timePart}\x1b[45m*********************************************************************************\x1b[0m`);

const http = require('http');
// const googleMapsAPI = require('@google-maps-platform/client');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Get Border Xing Data
let data = getBorderXingJsonData();
// console.log(`\x1b[44mdata =`);
// console.log(data);
// console.log(`\x1b[0m`);

// Map Info: API Key & Destination
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const origination = 'Tatlow Walk, Vancouver, BC V6G 3E2, Canada';
const destination = '3809+Alabama+St+98226';
// const destination = '3809+Alabama+St,+Bellingham,+WA+98226-4585';
const directionNS = (/Canada/i).test(destination) ? "northbound" : "southbound";
// console.log(`\x1b[41mdirectionNS = ${directionNS}\x1b[0m`);

// Filter the entries that are ONLY `directionNS`.
const borderXingsToUse = data.filter(entry => entry.direction === directionNS);

// Functions
// ***** BEGIN: Get travel info from Origianation-to-Border *****
const onePlaceToAnother = async (origOrDest, entry) => {
    // console.log(`Inside onePlaceToAnother \x1b[41mentry =`);
    // console.log(entry);
    // console.log(`\x1b[0m`);

    let fromHere = "";
    let toHere = "";

    if (origOrDest === 'origination') {
        fromHere = origination;
        toHere = entry.plusCode;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromHere}&destination=${toHere}&key=${apiKey}`;
        const response = await axios.get(url);
        entry.timeToBorder = convertToMinutes(response.data.routes[0].legs[0].duration.text);
        entry.distanceToBorder = parseFloat(response.data.routes[0].legs[0].distance.text.split(' ')[0]);
    } else {
        console.log(`Inside destination`);
        fromHere = entry.plusCode;
        toHere = destination;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromHere}&destination=${toHere}&key=${apiKey}`;
        const response = await axios.get(url);
        entry.timeToDestination = convertToMinutes(response.data.routes[0].legs[0].duration.text);
        entry.distanceToDestination = parseFloat(response.data.routes[0].legs[0].distance.text.split(' ')[0]);
    }

    // console.log(`Inside onePlaceToAnother \x1b[43mentry =`);
    // console.log(entry);
    // console.log(`\x1b[0m`);

    return entry;
};

const getOriginationToBorderInfo = async () => {
    const results = await Promise.all(borderXingsToUse.map(entry => onePlaceToAnother('origination', entry)));

    data = results;

    return data;
};

const getBorderToDestinationInfo = async () => {
    const results = await Promise.all(borderXingsToUse.map(entry => onePlaceToAnother('destination', entry)));

    data = results;

    return data;
};
// ***** END: Get travel info from Origianation-to-Border *****


const borderToDestinationInfo = async () => {
    // console.log(`\x1b[42mInside 'borderToDestinationInfo\x1b[0m'`);
    const sortedTravelTimes = await getShortestTravelTimes();
    // console.log(`\x1b[42mInside 'borderToDestinationInfo\x1b[0m'`);
    // console.log(`sortedTravelTimes =`);
    // console.log(sortedTravelTimes);
    await outputResults(sortedTravelTimes);

    // console.log(`\x1b[44mdata =`);
    // console.log(data);
    // console.log(`\x1b[0m`);

    return data;
};

const getShortestTravelTimes = async () => {
    // console.log(`\x1b[44mInside 'getShortestTravelTimes'\x1b[0m`);

    const travelTimes = await Promise.all(borderXingsToUse.map(toFromBorder));
    // console.log(`\x1b[44mtravelTimes =`);
    // console.log(travelTimes);
    // console.log(`\x1b[0m`);

    const sortedTravelTimes = travelTimes.sort((a, b) => parseInt(a.timeToDestination) - parseInt(b.timeToDestination));

    // console.log(`\x1b[42m**********************sortedTravelTimes =`);
    // console.log(sortedTravelTimes);
    // console.log(`\x1b[0m`);

    return sortedTravelTimes;
};

// Get travel info from external website
const toFromBorder = async (origin) => {
    // console.log(`Inside 'toFromBorder'`);

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.plusCode}&destination=${destination}&key=${apiKey}`;

    const response = await axios.get(url);

    origin.timeToDestination = response.data.routes[0].legs[0].duration.text.split(' ')[0];
    origin.distanceToDestination = response.data.routes[0].legs[0].distance.text.split(' ')[0];

    // console.log(`${response.data.routes[0].legs[0].duration.text.split(' ')[0]}min to get the ${response.data.routes[0].legs[0].distance.text.split(' ')[0]}mi from ${origin.nickname} to home.`);

    return origin;
};

const outputResults = async (sortedTravelTimes) => {
    // Output the results to the terminal window.
    console.log('Travel time & distance from each border Xing to destination:');
    for (const item of sortedTravelTimes) {
        console.log(`${item.timeToDestination}min from ${item.nickname} (${item.distanceToDestination}mi) -> Home`);
    }

    // !!!!!!!!!!!!!!!!!!!!!!! Ensure you don't need this BEFORE you decide to delete it !!!!!!!!!!!!!!!!!!!!!!!
    // // Output the results to a webpage.
    // const httpServer = http.createServer((req, res) => {
    //     res.setHeader('Content-Type', 'text/html');
    //     res.write(`<h1>Shortest travel times from each origin to destination</h1><ul>`);

    //     for (const item of sortedTravelTimes) {
    //         res.write(`<li>${item.timeToDestination}min from ${item.nickname} (${item.distanceToDestination}mi) -> Home</li>`);
    //     }

    //     res.write(`</ul>`);
    //     res.end();
    // });

    // httpServer.listen(3000, () => {
    //     console.log(`\x1b[45m****************************************************************Webpage listening on port 3000 on \x1b[41m${datePart}\x1b[45m at \x1b[41m${timePart}\x1b[45m****************************************************************\x1b[0m`);
    // });
    // !!!!!!!!!!!!!!!!!!!!!!! Ensure you don't need this BEFORE you decide to delete it !!!!!!!!!!!!!!!!!!!!!!!
};

module.exports = {
    data,
};

getOriginationToBorderInfo().then(data => {
    console.log(`\x1b[45mdata =`);
    console.log(data);
    console.log(`\x1b[0m`);
});

getBorderToDestinationInfo().then(data => {
    console.log(`\x1b[46mdata =`);
    console.log(data);
    console.log(`\x1b[0m`);
});

// Peace Arch -> Home
// https://maps.googleapis.com/maps/api/directions/json?origin=262W%2B32,+Blaine,+WA&destination=3809+Alabama+St,+Bellingham,+WA+98226-4585&key=AIzaSyCjaHm6AHGIH7x-Tx_S-y2Hv5xadsxxcqI