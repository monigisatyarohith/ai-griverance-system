const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message, html }) => {
  const sendPromise = (async () => {
    try {
      // Only log to console if no email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`📧 Email (no credentials configured):`);
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
        html: html || `<div style="font-family: Arial, sans-serif; padding: 20px;">
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
  })();

  if (process.env.VERCEL) {
    // In serverless (Vercel), we must await the promise to ensure the lambda doesn't freeze before sending.
    await sendPromise;
  } else {
    // Local development: fire-and-forget (asynchronous) to keep responses fast.
    sendPromise.catch(err => console.error('Background email sending failed:', err));
  }
};

module.exports = sendEmail;
