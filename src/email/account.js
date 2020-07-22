const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'shridharan.m@gmail.com',
        subject: 'Welcome to Task manager',
        text: `Hi ${name}, here is how you get the most out of our app!`
      };
      sgMail.send(msg);
}


const sendCancellationEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'shridharan.m@gmail.com',
        subject: 'Sorry to see you go',
        text: `Goodbye ${name}, We were wondering if there is anything we could have done better. Please let us know`
      };
      sgMail.send(msg);
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}