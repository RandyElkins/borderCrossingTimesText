// console.log(`1st line of \x1b[44m${__filename}\x1b[0m`);
const axios = require('axios');
const parseString = require('xml2js').parseString;

// Various sites to gather border time info
const canadaToUsTimesXmlUrl = 'https://bwt.cbp.gov/api/bwtrss/getAllPortsRss/Canada';
const usToCanadaTimesXmlUrlBlaine = 'https://canadabordertimes.com/blaine/';
const usToCanadaTimesXmlUrlLynden = 'https://canadabordertimes.com/lynden/';
const usToCanadaTimesXmlUrlSumas = 'https://canadabordertimes.com/sumas/';

async function canadaToUsBorderData() {
    const xmlData = await fetchCanadaToUsXMLData();
    // console.log('parseCanadaToUsXMLAndExtractInfo(xmlData)'); // Log to terminal
    return parseCanadaToUsXMLAndExtractInfo(xmlData);
}

async function usToCanadaBorderData() {
    const xmlData = await fetchUsToCanadaXMLData();
    // console.log('parseCanadaToUsXMLAndExtractInfo(xmlData)'); // Log to terminal
    return parseUsToCanadaXMLAndExtractInfo(xmlData);
}

async function fetchCanadaToUsXMLData() {
    try {
        const canadaToUsTimes = await axios.get(canadaToUsTimesXmlUrl);
        const xmlData = canadaToUsTimes.data;
        return xmlData;
    } catch (error) {
        console.error('Error fetching XML data:', error);
        throw error;
    }
}

async function fetchUsToCanadaXMLData() {
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
            const description = item.description[0];

            if (title === "Blaine - Pacific Highway" || title === "Blaine - Peace Arch" /*|| title === "Blaine - Point Roberts" */ || title === "Lynden" || title === "Sumas") {

                if (title === "Blaine - Pacific Highway") {
                    title = "Truck Xing-";
                    // title = "Truck Xing";
                } else if (title === "Blaine - Peace Arch") {
                    title = "Peace Arch";
                } else if (title === "Blaine - Point Roberts") {
                    title = "Pt Roberts";
                } else if (title === "Lynden") {
                    title = "Meridian----";
                    // title = "Meridian--";
                } else if (title === "Sumas") {
                    title = "Sumas-------";
                    // title = "Sumas-----";
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

    return outgoingMsgText;
}

function extractAndFormat(inputString) {
    const regex = /(\d+) General Lanes: At (\d{1,2}):(\d{2}) ([ap]m) P(?:D|S)T (\d+) min delay (\d+) lane\(s\) open/;
    const match = inputString.match(regex);

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


module.exports = { canadaToUsBorderData, usToCanadaBorderData };
// console.log(`Last line of \x1b[44m${__filename}\x1b[0m`);