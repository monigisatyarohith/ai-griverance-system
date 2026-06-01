const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const sendEmail = require('./sendEmail');

async function testEmail() {
  console.log('📤 Sending test email...');
  console.log(`   Using: ${process.env.EMAIL_USER}`);
  
  await sendEmail({
    email: process.env.EMAIL_USER, // send to yourself
    subject: '✅ College Grievance System - Test Email',
    message: 'This is a test email from your College Grievance Management System. If you received this, your email configuration is working correctly!'
  });

  console.log('🏁 Test complete!');
}

testEmail();
