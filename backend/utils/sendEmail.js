const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;

    // Check if the user has provided real Gmail credentials
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Fallback: Use a simulated testing account (Ethereal) so it doesn't crash
        console.warn('⚠️ No se detectaron EMAIL_USER o EMAIL_PASS. Usando cuenta de correo de prueba simulada (Ethereal).');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        process.env.EMAIL_USER = testAccount.user; // Mock the sender email
    }

    const message = {
        from: `ApuntesIT <${process.env.EMAIL_USER || 'test@example.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log('✅ Mensaje enviado exitosamente a: %s', info.messageId);

    // If we used the fallback ethereal account, log the URL so the developer can click it
    if (info.messageId && !process.env.EMAIL_PASS) {
        console.log('🌐 [MODO PRUEBA] Abre este enlace para ver el correo simulado: %s', nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
