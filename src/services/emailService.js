const nodemailer = require('nodemailer');

// ✅ Email configuration for MailerSend (with fallback to console log for dev)
const createTransporter = () => {
  if (!process.env.MAILERSEND_HOST || !process.env.MAILERSEND_USER || !process.env.MAILERSEND_PASS) {
    console.warn("⚠️ MailerSend SMTP credentials not set. Emails will be logged to console only.");
    return null; // we'll handle this in sendOTPEmail
  }

  return nodemailer.createTransport({
    host: process.env.MAILERSEND_HOST,   // e.g., smtp.mailersend.net
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.MAILERSEND_USER, // SMTP username from MailerSend
      pass: process.env.MAILERSEND_PASS  // SMTP password from MailerSend
    }
  });
};

// ✅ Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ Send OTP email
const sendOTPEmail = async (email, otp, firstName) => {
  try {
    const transporter = createTransporter();

    // If no transporter (dev mode), just log the OTP
    if (!transporter) {
      console.log(`📧 [DEV MODE] OTP for ${email}: ${otp}`);
      return { success: true, messageId: "mocked-dev" };
    }

    const mailOptions = {
      from: process.env.MAILERSEND_FROM_EMAIL || "noreply@example.com", // fallback if not set
      to: email,
      subject: 'Brainwave - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Brainwave!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for registering with Brainwave. Please use the following verification code to complete your registration:</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Brainwave. Please do not reply to this email.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
