const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Determine configuration depending on real or simulated mode
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const message = {
        from: `ApuntesIT <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log('Mensaje enviado: %s', info.messageId);
};

module.exports = sendEmail;
