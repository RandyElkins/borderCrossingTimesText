const { getCurrentDateAndTimeParts, convertToMinutes } = require('../common.js');
const { datePart, timePart } = getCurrentDateAndTimeParts();
// Intro message to tell where the new run begins
console.log(`\x1b[45m*********************************************************************************Inside \x1b[41m${__filename}\x1b[45m on \x1b[41m${datePart}\x1b[45m at \x1b[41m${timePart}\x1b[45m*********************************************************************************\x1b[0m`);

// const http = require('http');
// const googleMapsAPI = require('@google-maps-platform/client');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Map Info: API Key & Destination
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const origination = 'Tatlow Walk, Vancouver, BC V6G 3E2, Canada';
const destination = '3809+Alabama+St+98226'; // Only street & zip needed
// const destination = '3809+Alabama+St,+Bellingham,+WA+98226-4585';
const directionNS = (/Canada/i).test(destination) ? "northbound" : "southbound";

// Filter the entries that are ONLY `directionNS`.
const borderXingsToUse = data => data.filter(entry => entry.direction === directionNS);

// Functions
// ***** BEGIN: Get travel info from Origianation-to-Border *****
const onePlaceToAnother = async (origOrDest, entry) => {

    let fromHere = "";
    let toHere = "";

    if (origOrDest === 'origination') {
        fromHere = origination;
        toHere = entry.plusCode;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromHere}&destination=${toHere}&key=${apiKey}`;
        console.log(`\x1b[43murl = ${url}\x1b[0m`);

        const response = await axios.get(url);
        entry.timeToBorder = convertToMinutes(response.data.routes[0].legs[0].duration.text);
        const units = response.data.routes[0].legs[0].distance.text.split(' ')[1];
        const conversionValue = units === "km" ? 0.621371 : 1;
        entry.distanceToBorder = Math.round(parseFloat(response.data.routes[0].legs[0].distance.text.split(' ')[0]) * conversionValue * 10) / 10;
    } else {
        console.log(`Inside destination`);
        fromHere = entry.plusCode;
        toHere = destination;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromHere}&destination=${toHere}&key=${apiKey}`;
        console.log(`\x1b[43murl = ${url}\x1b[0m`);

        const response = await axios.get(url);
        entry.timeToDestination = convertToMinutes(response.data.routes[0].legs[0].duration.text);
        const units = response.data.routes[0].legs[0].distance.text.split(' ')[1];
        const conversionValue = units === "km" ? 0.621371 : 1;

        entry.distanceToDestination = Math.round(parseFloat(response.data.routes[0].legs[0].distance.text.split(' ')[0]) * conversionValue * 10) / 10;
    }

    // console.log(`Inside onePlaceToAnother \x1b[43mentry =`);
    // console.log(entry);
    // console.log(`\x1b[0m`);

    return entry;
};
// ***** END: Get travel info from Origianation-to-Border *****



async function getToFromBorderInfo(data) {

    // Get Origination-to-Border Info
    data = await Promise.all(borderXingsToUse(data).map(entry => onePlaceToAnother('origination', entry)));

    // Get Border-to-Destination Info
    data = await Promise.all(borderXingsToUse(data).map(entry => onePlaceToAnother('destination', entry)));

    return data;
};

module.exports = {
    getToFromBorderInfo,
};


// Peace Arch -> Home
// https://maps.googleapis.com/maps/api/directions/json?origin=262W%2B32,+Blaine,+WA&destination=3809+Alabama+St,+Bellingham,+WA+98226-4585&key=AIzaSyCjaHm6AHGIH7x-Tx_S-y2Hv5xadsxxcqI