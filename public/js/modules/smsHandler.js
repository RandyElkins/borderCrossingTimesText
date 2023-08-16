const twilio = require('twilio');

function sendSMS(number, text) {
    console.log('Inside sendSMS function');
    console.log(`Args 'number' = ${number}, & 'text' = ${text}.`);
    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    return client.messages
        .create({ body: `${text}.`, from: '+18449302025', to: process.env.PHONE_NUMBER })
        // .create({ body: `\nThe number sent over was ${number}, & the message sent was ${text}.`, from: '+18449302025', to: process.env.PHONE_NUMBER })
        .then(message => console.log(message, 'Message sent.'))
        .catch(err => console.log(err, 'Message NOT sent.'));
}

module.exports = { sendSMS };