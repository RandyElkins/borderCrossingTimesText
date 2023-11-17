// console.log(`Done loading`);
// console.log(`1st line of ${document.currentScript.src}`); // THIS is how you get the current script file in a BROWSER-BASED environment
// // console.log(`1st line of \x1b[46m${__filename}\x1b[0m`); // THIS did NOT work because '__filename' is NOT a BROWSER-BASED variable
// console.log(`Done loading`);

const numberInput = document.getElementById('number'),
    textInput = document.getElementById('msg'),
    button = document.getElementById('button'),
    tableBody = document.getElementsByTagName('table')[0].children[0],
    canadaToUsTimes = document.querySelector('.canadaToUsTimes'),
    usToCanadaTimes = document.querySelector('.usToCanadaTimes');

console.log(`tableBody =`);
console.log(tableBody);

// Southbound (Canada to US) on 2023-10-18 at 06:56:09
const tableTitleRow = tableBody.children[0].children[0];
tableTitleRow.innerText = `Southbound (Canada to US) on ${getCurrentDateAndTimeParts().datePart} at ${getCurrentDateAndTimeParts().timePart}`;

// const xmlHandler = require('./modules/xmlHandler'); // THIS did NOT work because './public/js/modules/xmlHandler' is NOT BROWSER-BASED
// const { getCurrentDateAndTimeParts, getBorderXingJsonData, convertToMinutes } = require('./common');

console.log(`getCurrentDateAndTimeParts().datePart`);
console.log(getCurrentDateAndTimeParts().datePart);

document.addEventListener("DOMContentLoaded", function () {
    fetch('/api/data')
        .then(canadaToUsTimes => canadaToUsTimes.json())
        .then(data => {

            // console.log(putDataInWebpageFriendlyFormat(data).canadaToUsConsole);
            const styleGood = 'background-color: green; color: white; font-style: normal; border: 1px solid black; font-size: 1em;'
            console.log(`%c${data[7].address}`, styleGood); // log to website (border times)
            // console.log(`%c${data.messageConsole}`, styleGood); // log to website (border times)
            // textInput.value = data.messageHtml;
            canadaToUsTimes.innerHTML = putDataInWebpageFriendlyFormat(data).canadaToUsHtml;
            // canadaToUsTimes.innerHTML = data.messageHtmlCanadaToUsTableTotal;
            usToCanadaTimes.innerHTML = data.messageHtmlUsToCanadaTableTotal;
            // canadaToUsTimes.innerHTML = data.messageHtml;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    data = '';
    // button.addEventListener('click', send, false);
});


// Functions
function putDataInWebpageFriendlyFormat(data) {
    console.log(data);
    const responseData = {
        canadaToUS: "",
        usToCanada: "",
    };

    // Filter southbound items
    const southboundItems = data.filter(item => item.direction === 'southbound');

    // Sort southbound items by ascending borderDelay
    southboundItems.sort((a, b) => a.totalTime - b.totalTime);
    // southboundItems.sort((a, b) => a.borderDelay - b.borderDelay);
    console.log(`southboundItems =`);
    console.log(southboundItems);

    // Loop through the table data array and create table cells (td) for each data item
    southboundItems.forEach(item => {
        // Create a table row
        const row = document.createElement('tr');
        // const cell = document.createElement('td');
        // cell.textContent = item; // Set the content of each cell
        // row.appendChild(cell); // Append each cell to the table row
        row.appendChild(document.createElement('td')).textContent = item.nickname;
        row.appendChild(document.createElement('td')).textContent = item.timeToBorder;
        row.appendChild(document.createElement('td')).textContent = item.distanceToBorder;
        row.appendChild(document.createElement('td')).textContent = item.borderTimeLastUpdated;
        row.appendChild(document.createElement('td')).textContent = item.borderDelay;
        row.appendChild(document.createElement('td')).textContent = `${item.borderLanesOpen}/${item.borderTotalLanes}`;
        row.appendChild(document.createElement('td')).textContent = item.timeToDestination;
        row.appendChild(document.createElement('td')).textContent = item.distanceToDestination;
        row.appendChild(document.createElement('td')).textContent = item.totalTime;
        row.appendChild(document.createElement('td')).textContent = item.totalDistance;

        // Append the table row to the table element
        tableBody.appendChild(row);
        console.log(12345687);
    });


    // // Append the created table to an existing HTML element with an ID of 'tableContainer'
    // document.getElementById('tableContainer').appendChild(table);
    // Create a messageHtml based on sorted items
    let messageHtml = 'Canada-to-US border xing times sorted by shortest delay time:<br>';
    let messageConsole = 'Canada-to-US border xing times sorted by shortest delay time:\n';
    southboundItems.forEach(item => {
        if (item.borderDelay >= 0) {
            // messageHtml += `${getCurrentDateAndTimeParts.datePart} at ${getCurrentDateAndTimeParts.timePart}` + canadaToUsBorderData.split('\n').join('<br>');
            messageHtml += `- ${item.nickname}: ${item.borderDelay} minutes<br>`;
            messageConsole += `- ${item.nickname}: ${item.borderDelay} minutes\n`;
        } else {
            messageHtml += `- ${item.nickname}: Currently closed<br>`;
            messageConsole += `- ${item.nickname}: Currently closed\n`;
        }
    });

    // Display the messageHtml
    console.log(`messageHtml`);

    responseData.canadaToUsHtml = messageHtml;
    responseData.canadaToUsConsole = messageConsole;

    return responseData;
}

function send() {
    console.log('%c********** BUTTON JUST CLICKED **********', 'background-color: red; color: white');
    // console.log('numberInput');
    // console.log(numberInput.value);
    // console.log('textInput');
    // console.log(textInput);
    // console.log('button');
    // console.log(button);
    // console.log('canadaToUsTimes');
    // console.log(canadaToUsTimes);

    // console.log(`numberInput.value = ${numberInput.value}`);
    const number = numberInput.value.replace(/\D/g, '');
    // console.log(`number = ${number}`);
    // console.log(`textInput = ${textInput}`);
    // console.log(`${textInput}`);
    // const text = textInput.value;
    console.log(`textInput.value = ${textInput.value}`);


    fetch('/', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ number: number, text: textInput.value })
    })
        .then(function (res) {
            const styleGood = 'background-color: green; color: white; font-style: italic; border: 5px solid black; font-size: 2em;'
            // console.log('%cYay, success...of sorts:', styleGood);

            console.log('%cres = ', styleGood, res);
        })
        .catch(function (err) {
            const styleBad = 'background-color: red; color: white; font-style: italic; border: 5px solid black; font-size: 2em;'
            console.log('%cBummer, not quite there yet:', styleBad);
            console.log('%cerr = ' + err, styleBad, err);
        })

    // Fetch data from the server
    fetch('/api/data')
        .then(canadaToUsTimes => canadaToUsTimes.json())
        .then(data => {
            console.log(data.messageConsole); // This will log "Hello from the server!" in the browser's console
            canadaToUsTimes.innerHTML = data.messageHtml;
        })
        .catch(error => {
            console.error('Error:', error);
        });

}