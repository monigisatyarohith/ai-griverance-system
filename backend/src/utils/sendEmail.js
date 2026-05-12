const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  try {
    // In development, log email instead of sending
    if (!process.env.EMAIL_USER || process.env.NODE_ENV === 'development') {
      console.log(`📧 Email (dev mode):`);
      console.log(`   To: ${email}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Message: ${message}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"College Grievance System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #3B82F6;">${subject}</h2>
        <p>${message}</p>
        <hr style="border-color: #E5E7EB;" />
        <p style="color: #9CA3AF; font-size: 12px;">College Grievance Management System</p>
      </div>`
    });

    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    // Don't throw - email failure shouldn't break the flow
  }
};

module.exports = sendEmail;
