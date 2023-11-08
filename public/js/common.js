// console.log(`1st line of \x1b[45m${__filename}\x1b[0m`); // PURPLE background with BLACK font

function getCurrentDateAndTimeParts() {
    const formattedDate = new Date().toLocaleString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const [datePart, timePart] = formattedDate.split(', ');

    return { datePart, timePart };
}


function getBorderXingJsonData() {
    // Fetch & Read the JSON file from the filesystem
    const fs = require('fs');
    const jsonData = fs.readFileSync('./borderXings.json');

    // Parse the JSON file into a JavaScript object.
    const data = JSON.parse(jsonData);
    // console.log(`\x1b[42m**********************getBorderXingJsonData =`);
    // console.log(data);
    // console.log(`\x1b[0m`);

    return data;
}

function convertToMinutes(timeString) {
    // console.log(`timeString =`);
    // console.log(timeString);

    const regex = /(\d+)\s*hour(?:s)?\s*(\d+)\s*min(?:ute)?s?|(\d+)\s*min(?:ute)?s?/i;
    // console.log(`regex =`);
    // console.log(regex);
    const matches = timeString.match(regex);
    // console.log(`matches =`);
    // console.log(matches);

    if (matches) {
        let hours = 0;
        let minutes = 0;

        if (matches[1]) {
            hours = parseInt(matches[1], 10);
        }

        if (matches[2]) {
            minutes = parseInt(matches[2], 10);
        }

        if (matches[3]) {
            minutes = parseInt(matches[3], 10);
        }

        return hours * 60 + minutes;
    }

    return null; // Invalid input format
}

function logFunctionName() {
    const error = new Error();
    if (error.stack) {
        const callerLine = error.stack.split('\n')[2];
        const functionName = /\sat (.+?)\s\(/.exec(callerLine)[1];
        // console.log('Inside function:', functionName);
        return `Inside function: ${functionName}`;
    }
}

module.exports = {
    getCurrentDateAndTimeParts,
    getBorderXingJsonData,
    convertToMinutes,
    logFunctionName,
};

// getBorderXingJsonData();
// console.log(`Last line of \x1b[45m${__filename}\x1b[0m`);