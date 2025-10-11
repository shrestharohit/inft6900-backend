////////////////////////////////////////////////
// Common emails
////////////////////////////////////////////////
const OTPMsg = ({ firstName, otp }) =>`
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
    `;

const OTPEmailForpasswordResetMsg = ({ firstName, otp }) => `
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
    `;

    
////////////////////////////////////////////////
// Admin/Course Owner emails
////////////////////////////////////////////////
const initialPasswordMsg = ({ firstName, password }) => `
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
    `;


////////////////////////////////////////////////
// Admin emails
////////////////////////////////////////////////
const approvalRequestNotificationMsg = ({ requestor, requestingItem }) => `
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
    `;


////////////////////////////////////////////////
// Course Owner emails
////////////////////////////////////////////////
const approvalNotificationMsg = ({ requestor, requestingItem }) => `
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
    `;

const declineNotificationMsg = ({ requestor, requestingItem }) => `
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
    `;


module.exports = {
    OTPMsg,
    OTPEmailForpasswordResetMsg,
    initialPasswordMsg,
    approvalRequestNotificationMsg,
    approvalNotificationMsg,
    declineNotificationMsg
}