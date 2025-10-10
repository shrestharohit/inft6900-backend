const nodemailer = require("nodemailer");
const User = require('../models/User');
const { getNotificationReceivers } = require('../controllers/notificationSettingController');
const {
    OTPMsg,
    OTPEmailForpasswordResetMsg,
    initialPasswordMsg,
    approvalRequestNotificationMsg,
    approvalNotificationMsg,
    declineNotificationMsg
} = require('../config/constants')

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
      html: OTPMsg,
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
      html: OTPEmailForpasswordResetMsg,
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
      html: initialPasswordMsg,
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
    const receivers = await getNotificationReceivers('1', admins);
    
    if (receivers.length === 0) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }

    console.log(receivers)

    const emails = receivers.map(row => row.email)
    console.log("sending emails to followigs... " + emails);

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: emails,
      subject: "Brainwave - Request for approval",
      html: approvalRequestNotificationMsg,
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

    const receivers = await getNotificationReceivers('2', [requestor]);
    console.log(receivers)
    if (receivers.length === 0) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: requestor.email,
      subject: `Brainwave - ${requestingItem.type} Approved`,
      html: approvalNotificationMsg,
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

    const receivers = await getNotificationReceivers('3', [requestor]);

    if (receivers.length === 0) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: requestor.email,
      subject: `Brainwave - ${requestingItem.type} Delined`,
      html: declineNotificationMsg,
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
