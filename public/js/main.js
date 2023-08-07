const date = new Date();
const formattedDate = date.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const [datePart, timePart] = formattedDate.split(', ');
console.log(`datePart = ${datePart}`);
console.log(`timePart = ${timePart}`);

const numberInput = document.getElementById('number'),
    textInput = document.getElementById('msg'),
    button = document.getElementById('button'),
    response = document.querySelector('.response');

textInput.value = timePart;

button.addEventListener('click', send, false);

// Functions
function send() {
    console.log('Inside send function');
    console.log('numberInput');
    console.log(numberInput.innerText);
    console.log('textInput');
    console.log(textInput);
    console.log('button');
    console.log(button);
    console.log('response');
    console.log(response);

    console.log(`numberInput.value = ${numberInput.value}`);
    const number = numberInput.value.replace(/\D/g, '');
    console.log(`number = ${number}`);
    console.log(`textInput = ${textInput}`);
    const text = textInput.value;
    console.log(`text = ${text}`);


    const date = new Date();
    const formattedDate = date.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const [datePart, timePart] = formattedDate.split(', ');
    console.log(`datePart = ${datePart}`);
    console.log(`timePart = ${timePart}`);


    fetch('/', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ number: number, text: text })
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
}


