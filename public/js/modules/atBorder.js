console.log(`******************* 1st line of \x1b[44m${__filename}\x1b[0m *******************`);
const { getCurrentDateAndTimeParts, getBorderXingJsonData, convertToMinutes } = require('../common');
const axios = require('axios');
const parseString = require('xml2js').parseString;
// console.log(`\x1b[45m`);
// console.log(`Inside ${__filename}`);
// console.log(`\x1b[0m`);
const { logFunctionName } = require('../common');

let data = getBorderXingJsonData();

// Map Info: API Key & Destination
const destination = '3809+Alabama+St+98226';
const directionNS = (/Canada/i).test(destination) ? "northbound" : "southbound";

// Filter the entries that are ONLY `directionNS`.
const borderXingsToUse = data.filter(entry => entry.direction === directionNS);
// console.log(`\x1b[45mborderXingsToUse =`);
// console.log(borderXingsToUse);
// console.log(`\x1b[0m`);

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

const southboundBorderXingInfo = async () => {
    console.log(`${logFunctionName()} within ${__filename}`);
    const xmlData = await fetchCanadaToUsXMLData();

    const results = await Promise.all(borderXingsToUse.map(entry => onePlaceToAnother('origination', entry)));

    data = xmlData;

    return data;
};

// const northboundBorderXingInfo = async () => {
//     const results = await Promise.all(borderXingsToUse.map(entry => onePlaceToAnother('destination', entry)));

//     data = results;

//     return data;
// };
// ***** END: Get travel info from Origianation-to-Border *****

// Various sites to gather border time info
const canadaToUsTimesXmlUrl = 'https://bwt.cbp.gov/api/bwtrss/getAllPortsRss/Canada';
const usToCanadaTimesXmlUrlBlaine = 'https://canadabordertimes.com/blaine/';
const usToCanadaTimesXmlUrlLynden = 'https://canadabordertimes.com/lynden/';
const usToCanadaTimesXmlUrlSumas = 'https://canadabordertimes.com/sumas/';

async function canadaToUsBorderData() {
    // console.log(`${logFunctionName()} within ${__filename}`);
    const xmlData = await fetchCanadaToUsXMLData();
    // console.log(`\x1b[45mparseCanadaToUsXMLAndExtractInfo(xmlData) =`);
    // console.log(parseCanadaToUsXMLAndExtractInfo(xmlData));
    // console.log(`\x1b[0m`);
    return parseCanadaToUsXMLAndExtractInfo(xmlData);
}

async function usToCanadaBorderData() {
    // console.log(`${logFunctionName()} within ${__filename}`);
    const xmlData = await fetchUsToCanadaXMLData();
    // console.log('parseCanadaToUsXMLAndExtractInfo(xmlData)'); // Log to terminal
    return parseUsToCanadaXMLAndExtractInfo(xmlData);
}

async function fetchCanadaToUsXMLData() {
    // console.log(`${logFunctionName()} within ${__filename}`);
    try {
        const canadaToUsTimes = await axios.get(canadaToUsTimesXmlUrl);
        const xmlData = canadaToUsTimes.data;
        // console.log(`\x1b[45mxmlData =`);
        // console.log(xmlData);
        // console.log(`\x1b[0m`);
        return xmlData;
    } catch (error) {
        console.error('Error fetching XML data:', error);
        throw error;
    }
}

async function fetchUsToCanadaXMLData() {
    // console.log(`${logFunctionName()} within ${__filename}`);
    try {
        const usToCanadaTimesBlaine = await axios.get(usToCanadaTimesXmlUrlBlaine);
        const usToCanadaTimesLynden = await axios.get(usToCanadaTimesXmlUrlLynden);
        const usToCanadaTimesSumas = await axios.get(usToCanadaTimesXmlUrlSumas);
        const xmlDataBlaineData = usToCanadaTimesBlaine.data;
        const xmlDataLyndenData = usToCanadaTimesLynden.data;
        const xmlDataSumasData = usToCanadaTimesSumas.data;
        console.log(`\x1b[41mxmlDataBlaineData\x1b[0m =`); // RED background with BLACK font
        console.log(xmlDataBlaineData);
        console.log(`\x1b[41mxmlDataLyndenData\x1b[0m =`); // RED background with BLACK font
        console.log(xmlDataLyndenData);
        console.log(`\x1b[41mxmlDataSumasData\x1b[0m =`); // RED background with BLACK font
        console.log(xmlDataSumasData);
        return xmlDataBlaineData;
    } catch (error) {
        console.error('Error fetching XML data:', error);
        throw error;
    }
}

function parseCanadaToUsXMLAndExtractInfo(xmlData) {
    // console.log(`${logFunctionName()} within ${__filename}`);

    let outgoingMsgText = '';

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
            let title = item.title[0];
            // console.log(`\x1b[46mtitle =`);
            // console.log(title);
            // console.log(`\x1b[0m`);
            const description = item.description[0];
            // console.log(`\x1b[46mdescription =`);
            // console.log(description);
            // console.log(`\x1b[0m`);

            if (title === "Blaine - Pacific Highway" || title === "Blaine - Peace Arch" /*|| title === "Blaine - Point Roberts" */ || title === "Lynden" || title === "Sumas") {

                if (title === "Blaine - Pacific Highway") {
                    title = "Truck Xing-";
                    nickname = "Truck Xing";
                } else if (title === "Blaine - Peace Arch") {
                    title = "Peace Arch";
                    nickname = "Peace Arch";
                } else if (title === "Blaine - Point Roberts") {
                    title = "Pt Roberts";
                    nickname = "Meridian";
                } else if (title === "Lynden") {
                    title = "Meridian----";
                    nickname = "Meridian";
                } else if (title === "Sumas") {
                    title = "Sumas-------";
                    nickname = "Sumas";
                } else {
                    title = "IDK";
                }

                // Find the index of the item with the specified "nickname" and "direction"
                const index = data.findIndex(
                    (item) => item.nickname === nickname && item.direction === directionNS
                );

                // Next Part
                if (description !== null && description !== undefined) {
                    // *********************************
                    // *********************************
                    const description2 = description._;
                    const regex = /Maximum Lanes:(.*?)Maximum Lanes:(.*?)Nexus Lanes:/s;

                    const match = description2.match(regex);

                    if (match && match[2]) {
                        const extractedText = match[2].trim();
                        // console.log(`\x1b[42mextractedText =`);
                        // console.log(extractedText);
                        // console.log(`\x1b[0m`);

                        // **************************************
                        const resultExtractAndFormat = extractAndFormat(extractedText);
                        // **************************************

                        // Check if the item was found
                        if (index !== -1) {
                            if (resultExtractAndFormat === `---General Lanes: Lanes Closed----`) {
                                // Update the "border..." properties new values
                                data[index].borderTimeLastUpdated = 'N/A';
                                data[index].borderDelay = 'N/A';
                                data[index].borderLanesOpen = 'N/A';
                                data[index].borderTotalLanes = 'N/A';

                                // console.log(`\x1b[41mGeneral Lanes currently closed at ${nickname}\x1b[0m`); // Log the updated item

                            } else {
                                // Update the "border..." properties new values
                                data[index].borderTimeLastUpdated = resultExtractAndFormat[0];
                                data[index].borderDelay = resultExtractAndFormat[1];
                                data[index].borderLanesOpen = resultExtractAndFormat[2];
                                data[index].borderTotalLanes = resultExtractAndFormat[3];

                                // console.log(`\x1b[41m${title}${data[index].borderTimeLastUpdated}-${data[index].borderDelay}min delay-${data[index].borderLanesOpen}/${data[index].borderTotalLanes} lanes open\x1b[0m`); // Log the updated item
                                // console.log(data[index]); // Log the updated item
                            }

                        } else {
                            console.error("Item not found.");
                        }


                        // console.log(`\x1b[42m${title}: ${extractAndFormat(extractedText)}\x1b[0m`); // Log to terminal
                        outgoingMsgText += `\n${title}: ${extractAndFormat(extractedText)}`;
                        // outgoingMsgText += `${title}: ${extractAndFormat(extractedText)}\n`;

                    } else {
                        console.log("Text not found."); // Log to terminal
                    }

                    // *********************************
                    // *********************************
                } else {
                    console.log('If statement was FALSE.'); // Log to terminal
                }

            }
        });
    });

    // console.log(`\x1b[42moutgoingMsgText =`);
    // console.log(outgoingMsgText);
    // console.log(`\x1b[0m`);

    // console.log(`\x1b[46mdata =`);
    // console.log(data);
    // console.log(`\x1b[0m`);
    return data;
}

function extractAndFormat(inputString) {
    // console.log(`${logFunctionName()} within ${__filename}`);
    const regex = /(\d+) General Lanes: At (\d{1,2}):(\d{2}) ([ap]m) P(?:D|S)T (\d+) min delay (\d+) lane\(s\) open/;
    const match = inputString.match(regex);

    let arrExtractAndFormat = [];

    if (match && match[1] && match[2] && match[3] && match[4] && match[5] && match[6]) {
        const totalLanes = match[1]; // Example: "10" = 10 total lanes
        const hour = match[2];       // Example:  "9" = 9 o'clock
        const minute = match[3];     // Example: "00" = 00 minutes past the hour above
        const period = match[4];     // Example: "pm" = pm; evening
        const delay = match[5];      // Example: "15" = 15min delay
        const lanesOpen = match[6];  // Example:  "3" = 3 lanes open

        const formattedTime = formatTime(
            period.toLowerCase() === 'pm' && hour !== '12'
                ? String(Number(hour) + 12)
                : period.toLowerCase() === 'am' && hour === '12'
                    ? '00'
                    : hour,
            minute
        );

        const paddedLanesOpen = lanesOpen.padStart(2, '0');
        const paddedTotalLanes = totalLanes.padStart(2, '0');

        arrExtractAndFormat = [formattedTime, delay.padStart(2, '0'), paddedLanesOpen, paddedTotalLanes];

        return arrExtractAndFormat;
        // return `${formattedTime}-${delay.padStart(2, '0')}min delay-${paddedLanesOpen}/${paddedTotalLanes} lanes open`;
    } else {
        return `---General Lanes: Lanes Closed----`;
    }
}

function formatTime(hour, minute) {
    // console.log(`${logFunctionName()} within ${__filename}`);
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}


module.exports = { canadaToUsBorderData, usToCanadaBorderData };


canadaToUsBorderData();
// console.log(`Last line of \x1b[44m${__filename}\x1b[0m`);