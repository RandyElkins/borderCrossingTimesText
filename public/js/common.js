console.log(`1st line of ${__filename}`);
// ./public/js/common.js

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

module.exports = getCurrentDateAndTimeParts;


console.log(`Last line of ${__filename}`);