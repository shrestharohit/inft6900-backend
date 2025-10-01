const nodemailer = require("nodemailer");
const User = require('../models/User');

// Email configuration for MailerSend
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    // control TLS requirement via SMTP_REQUIRE_TLS env var (true/false)
    requireTLS: process.env.SMTP_FROM_EMAIL ? true : false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, firstName) => {
  try {
    const transporter = createTransporter();

    // ✅ Always log OTP to backend terminal for now
    console.log(`📩 OTP for ${email} (${firstName}): ${otp}`);

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Brainwave - Email Verification Code",
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
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    return { success: false, error: error.message };
  }
};


// Send OTP email for password reset
const sendOTPEmailForpasswordReset = async (email, otp, firstName) => {
  try {
    const transporter = createTransporter();

    // ✅ Always log OTP to backend terminal for now
    console.log(`📩 OTP for ${email} (${firstName}): ${otp}`);

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Brainwave - Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password reset</h2>
          <p>Hi ${firstName},</p>
          <p>Here is a verification code to reset your password:</p>
          
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
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    return { success: false, error: error.message };
  }
};


// Send inital password for admin and course owner
const sendInitialPassword = async (email, password, firstName) => {
  try {
    const transporter = createTransporter();

    // ✅ Always log OTP to backend terminal for now
    console.log(`📩 Initial password for ${email} (${firstName}): ${password}`);

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Brainwave - Your account has been created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Brainwave!</h2>
          <p>Hi ${firstName},</p>
          <p>Your account has been created by our admin. Here is the initial password:</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${password}</h1>
          </div>
          
          <p>Please do not share this password wtih anyone.</p>
          <p>If you did not request for account registration, please ignore this email.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Brainwave. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Initial password email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send iInitial password email:", error);
    return { success: false, error: error.message };
  }
};




// Notification for Request for approval
const sendApprovalRequestNotification = async (requestor, requestingItem) => {
  try {
    const transporter = createTransporter();
    const admins = await User.findByRole('admin');
    const emails = admins.map(row => row.email)
    console.log("sending emails to followigs... " + emails);

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: emails,
      subject: "Brainwave - Request for approval",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Action required: Please approve or decline the request</h2>
          <p>There is a new request for approval from ${requestor.firstName}.</p>
                    
          <p>Request item: ${requestingItem.type}</p>
          <p>Request item name: ${requestingItem.name}</p>
          
          <p>Please login to Brainwave and approve or decline the request.</p>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Brainwave. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Request notification sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send request notification:", error);
    return { success: false, error: error.message };
  }
};


// Notification for approval
const sendApprovalNotification = async (requestor, requestingItem) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: requestor.email,
      subject: `Brainwave - ${requestingItem.type} Approved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your request has been approved</h2>
          <p>Hi ${requestor.firstName},</p>

          <p>Your requested item has been approved by our admin. Here is the detail of approval result.</p>
          <p>Request item: ${requestingItem.type}</p>
          <p>Request item name: ${requestingItem.name}</p>
          
          <p>Please login to Brainwave to see more detail.</p>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Brainwave. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Approval notification sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send approval notification:", error);
    return { success: false, error: error.message };
  }
};

// Notification for decline
const sendDeclineNotification = async (requestor, requestingItem) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: requestor.email,
      subject: `Brainwave - ${requestingItem.type} Delined`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your request has been declined</h2>
          <p>Hi ${requestor.firstName},</p>

          <p>Your requested item has been declined by our admin. Here is the detail of approval result.</p>
          <p>Request item: ${requestingItem.type}</p>
          <p>Request item name: ${requestingItem.name}</p>
          
          <p>Please login to Brainwave to see more detail.</p>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Brainwave. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Decline notification sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send decline notification:", error);
    return { success: false, error: error.message };
  }
};




module.exports = {
  generateOTP,
  sendOTPEmail,
  sendOTPEmailForpasswordReset,
  sendInitialPassword,
  sendApprovalRequestNotification,
  sendApprovalNotification,
  sendDeclineNotification
};
