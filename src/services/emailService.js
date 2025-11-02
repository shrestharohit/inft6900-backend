const nodemailer = require("nodemailer");
const User = require('../models/User');
const { getNotificationReceivers } = require('../controllers/notificationSettingController');
const {
    OTPMsg,
    OTPEmailForpasswordResetMsg,
    initialPasswordMsg,
    approvalRequestNotificationMsg,
    approvalNotificationMsg,
    declineNotificationMsg,
    newDMMsg,
    DMRepliedMsg,
    newCourseReviewMsg
} = require('../config/emailTemplates')

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
      html: OTPMsg({ firstName, otp }),
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
      html: OTPEmailForpasswordResetMsg({ firstName, otp }),
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
      html: initialPasswordMsg({ firstName, password }),
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
    const receivers = admins.filter(admin => admin.notificationEnabled === true)
    
    if (receivers.length === 0) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }

    const emails = receivers.map(row => row.email)
    console.log("sending emails to followigs... " + emails);

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: emails,
      subject: "Brainwave - Request for approval",
      html: approvalRequestNotificationMsg({ requestor, requestingItem }) ,
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

    if (!requestor.notificationEnabled) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: requestor.email,
      subject: `Brainwave - ${requestingItem.type} Approved`,
      html: approvalNotificationMsg({ requestor, requestingItem }),
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

    if (!requestor.notificationEnabled) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: requestor.email,
      subject: `Brainwave - ${requestingItem.type} Delined`,
      html: declineNotificationMsg({ requestor, requestingItem }),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Decline notification sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send decline notification:", error);
    return { success: false, error: error.message };
  }
};


// Notification for course owner receiving DM
const sendDMNotificationToOwner = async (recipient, dm) => {
  try {
    const transporter = createTransporter();

    if (!recipient.notificationEnabled) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: recipient.email,
      subject: `Brainwave - New question for your course, ${dm.title} `,
      html: newDMMsg({ recipient, dm }),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ New DM notification sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send new DM notification:", error);
    return { success: false, error: error.message };
  }
};

// Notification for course owner receiving DM
const sendDMNotificationToStudent = async (recipient, dm) => {
  try {
    const transporter = createTransporter();

    if (!recipient.notificationEnabled) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: recipient.email,
      subject: `Brainwave - You received a reply from your course owner of ${dm.title} `,
      html: DMRepliedMsg({ recipient, dm }),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ DM reply notification sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send DM reply notification:", error);
    return { success: false, error: error.message };
  }
};


// Notification for course owner receiving DM
const sendNewReviewNotification = async (recipient, courseName, review) => {
  try {
    const transporter = createTransporter();

    if (!recipient.notificationEnabled) {
      console.log("✅ No error occured, but notification setting turned off for user");
      return { success: true };
    }
    
    console.log(review)

    const mailOptions = {
      from: process.env.SMPT_FROM_EMAIL || process.env.SMTP_USER,
      to: recipient.email,
      subject: `Brainwave - You received a new review for your course, ${courseName} `,
      html: newCourseReviewMsg({ recipient, courseName, review }),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ New review notification sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send new review notification:", error);
    return { success: false, error: error.message };
  }
};

// Notification for new announcement to students
const sendNewAnnouncementNotification = async (recipients, announcement) => {
  try {
    const transporter = createTransporter();

    const activeRecipients = recipients.filter(r => r.notificationEnabled);
    if (activeRecipients.length === 0) {
      console.log("✅ No users have email notifications enabled for announcements");
      return { success: true };
    }

    for (const user of activeRecipients) {
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
        to: user.email,
        subject: `Brainwave - New announcement in ${announcement.courseName}`,
        html: newAnnouncementMsg({ firstName: user.firstName, announcement }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`📩 Announcement email sent to ${user.email}`);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send announcement notification:", error);
    return { success: false, error: error.message };
  }
};


// Notification for user when their post gets a reply
const sendPostReplyNotification = async (recipient, post) => {
  try {
    const transporter = createTransporter();

    if (!recipient.notificationEnabled) {
      console.log("✅ No error occurred, but notification setting turned off for user");
      return { success: true };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: recipient.email,
      subject: `Brainwave - Someone replied to your post in ${post.courseName}`,
      html: PostRepliedMsg({ firstName: recipient.firstName, post }),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Post reply notification sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send post reply notification:", error);
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
  sendDeclineNotification,
  sendDMNotificationToOwner,
  sendDMNotificationToStudent,
  sendNewReviewNotification,
  sendNewAnnouncementNotification,
  sendPostReplyNotification
};
