console.log(`1st line of \x1b[43m${__filename}\x1b[0m`);
const twilio = require('twilio');

function sendSMS(number, text) {
    console.log('Inside sendSMS function');
    console.log(`Args 'number' = ${number}, & 'text' = ${text}.`);
    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    return client.messages
        .create({ body: `${text}.`, from: process.env.TWILIO_NUMBER, to: process.env.RECIPIENT_NUMBER })
        .then(message => console.log(message, 'Message sent.'))
        .catch(err => console.log(err, 'Message NOT sent.'));
}

module.exports = { sendSMS };
console.log(`Last line of \x1b[43m${__filename}\x1b[0m`);