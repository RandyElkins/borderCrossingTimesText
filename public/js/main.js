// console.log(`Done loading`);
// console.log(`1st line of ${document.currentScript.src}`); // THIS is how you get the current script file in a BROWSER-BASED environment
// // console.log(`1st line of \x1b[46m${__filename}\x1b[0m`); // THIS did NOT work because '__filename' is NOT a BROWSER-BASED variable
// console.log(`Done loading`);

const numberInput = document.getElementById('number'),
    textInput = document.getElementById('msg'),
    button = document.getElementById('button'),
    response = document.querySelector('.response');

// const xmlHandler = require('./modules/xmlHandler'); // THIS did NOT work because './public/js/modules/xmlHandler' is NOT BROWSER-BASED

document.addEventListener("DOMContentLoaded", function () {
    // console.log(`Done loading`);

    // console.log(`numberInput = `);
    // console.log(numberInput.value);
    // console.log(`textInput = `);
    // console.log(textInput);
    // console.log(`button = `);
    // console.log(button);
    // console.log(`response = `);
    // console.log(response);

    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            const styleGood = 'background-color: green; color: white; font-style: normal; border: 1px solid black; font-size: 1em;'
            console.log(`%c${data.messageConsole}`, styleGood); // log to website (border times)
            textInput.value = data.messageHtml;
            response.innerHTML = data.messageHtml;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    button.addEventListener('click', send, false);
});


// Functions
function send() {
    console.log('%c********** BUTTON JUST CLICKED **********', 'background-color: red; color: white');
    // console.log('numberInput');
    // console.log(numberInput.value);
    // console.log('textInput');
    // console.log(textInput);
    // console.log('button');
    // console.log(button);
    // console.log('response');
    // console.log(response);

    // console.log(`numberInput.value = ${numberInput.value}`);
    const number = numberInput.value.replace(/\D/g, '');
    // console.log(`number = ${number}`);
    // console.log(`textInput = ${textInput}`);
    // console.log(`${textInput}`);
    // const text = textInput.value;
    console.log(`text = ${textInput.value}`);


    fetch('/', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ number: number, text: textInput.value })
    })
        .then(function (res) {
            const styleGood = 'background-color: green; color: white; font-style: italic; border: 5px solid black; font-size: 2em;'
            console.log('%cYay, success...of sorts:', styleGood);

            console.log('%cres = ', styleGood, res);
        })
        .catch(function (err) {
            const styleBad = 'background-color: red; color: white; font-style: italic; border: 5px solid black; font-size: 2em;'
            console.log('%cBummer, not quite there yet:', styleBad);
            console.log('%cerr = ' + err, styleBad, err);
        })

    // Fetch data from the server
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            console.log(data.messageConsole); // This will log "Hello from the server!" in the browser's console
            response.innerHTML = data.messageHtml;
        })
        .catch(error => {
            console.error('Error:', error);
        });

}