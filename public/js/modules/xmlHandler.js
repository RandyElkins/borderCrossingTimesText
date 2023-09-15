console.log(`1st line of \x1b[44m${__filename}\x1b[0m`);
const axios = require('axios');
const parseString = require('xml2js').parseString;

const xmlUrl = 'https://bwt.cbp.gov/api/bwtrss/getAllPortsRss/Canada';

async function borderData() {
    const xmlData = await fetchXMLData();
    console.log('parseXMLAndExtractInfo(xmlData)'); // Log to terminal
    return parseXMLAndExtractInfo(xmlData);
}

async function fetchXMLData() {
    try {
        const response = await axios.get(xmlUrl);
        const xmlData = response.data;
        return xmlData;
    } catch (error) {
        console.error('Error fetching XML data:', error);
        throw error;
    }
}

let outgoingMsgText = '';
let outgoingMsgObj = {};

function parseXMLAndExtractInfo(xmlData) {

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
            const description = item.description[0];

            if (title === "Blaine - Pacific Highway" || title === "Blaine - Peace Arch" /*|| title === "Blaine - Point Roberts" */ || title === "Lynden" || title === "Sumas") {

                if (title === "Blaine - Pacific Highway") {
                    title = "Truck Xing";
                } else if (title === "Blaine - Peace Arch") {
                    title = "Peace Arch";
                } else if (title === "Blaine - Point Roberts") {
                    title = "Pt Roberts";
                } else if (title === "Lynden") {
                    title = "Meridian--";
                } else if (title === "Sumas") {
                    title = "Sumas-----";
                } else {
                    title = "IDK";
                }

                if (description !== null && description !== undefined) {
                    // *********************************
                    // *********************************
                    const description2 = description._;
                    const regex = /Maximum Lanes:(.*?)Maximum Lanes:(.*?)Nexus Lanes:/s;
                    const match = description2.match(regex);

                    if (match && match[2]) {
                        const extractedText = match[2].trim();

                        // **************************************
                        extractAndFormat(extractedText);
                        // **************************************

                        console.log(`\x1b[42m${title}: ${extractAndFormat(extractedText)}\x1b[0m`); // Log to terminal
                        outgoingMsgText += `\n${title}: ${extractAndFormat(extractedText)}`;
                        // outgoingMsgText += `${title}: ${extractAndFormat(extractedText)}\n`;
                        outgoingMsgObj = {
                            title: title,
                            extractedText: extractAndFormat(extractedText),
                        }
                        // console.log(`\x1b[42m${outgoingMsgObj[title]}: \x1b[0m`);
                        // console.log(`\x1b[42m${extractAndFormat(extractedText)}\x1b[0m`);
                        // console.log(`\x1b[42m${outgoingMsgObj[title]}: ${outgoingMsgObj[extractedText]}\x1b[0m`);
                        // outgoingMsgObj[title] = extractAndFormat(extractedText);

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

    // return outgoingMsgObj;
    return outgoingMsgText;
}

function extractAndFormat(inputString) {
    const regex = /(\d+) General Lanes: At (\d{1,2}):(\d{2}) ([ap]m) PDT (\d+) min delay (\d+) lane\(s\) open/;
    // console.log(`regex = ${regex}`);
    const match = inputString.match(regex);
    // console.log(`match = ${match}`);

    // console.log(match);

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

        return `${formattedTime}-${delay.padStart(2, '0')}min delay-${paddedLanesOpen}/${paddedTotalLanes} lanes open`;
    } else {
        return `---General Lanes: Lanes Closed----`;
    }
}

function formatTime(hour, minute) {
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}


module.exports = { borderData };
console.log(`Last line of \x1b[44m${__filename}\x1b[0m`);