const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const Enrolment = require('../models/Enrolment');
const Course = require('../models/Course');
const { VALID_REVIEW_STATUS } = require('../config/constants');
const { 
    sendDMNotificationToOwner,
    sendDMNotificationToStudent 
} = require('../services/emailService')

const register = async (req, res) => {
    try {
        const { userID, courseID, message } = req.body;

        // Basic validataion
        if (!userID || !courseID || !message) {
            return res.status(400).json({ 
                error: 'User ID, Course ID and message are required' 
            });
        };

        // Validate course ID
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        };

        // Validate user ID
        const user = await User.findById(userID);
        if (!user || user.role !== "student") {
            return res.status(400).json({
                error: 'Invalid user ID. Student does not exist.'
            });
        };

        // Validate enrolment (allow only enrolled user to give DM)
        const enrolment = await Enrolment.findByCourseIdUserID(courseID, userID);
        if (!enrolment) {
            return res.status(400).json({
                error: 'Enrolment not found. Cannot send message for non-enrolling course'
            });
        };
        
        // Create DM
        const newDM = await DirectMessage.create({
            userID,
            courseID,
            message
        });

        // Send notification
        sendNotificaDtion(newDM.msgID)

        res.json({
            message: 'Direct message sent successfully',
            dm: newDM
        })


    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const update = async (req, res) => {
    try {
        const msgID = req.params.msgID;
        const { message, reply, status } = req.body;

        // Basic validataion
        if (!msgID) {
            return res.status(400).json({ 
                error: 'Message ID is required' 
            });
        };

        // Validate msg ID
        const dm = await DirectMessage.findById(msgID, ['active', 'inactive']);
        if (!dm) {
            return res.status(400).json({
                error: 'Invalid message ID. Direct message does not exist.'
            });
        };
        
        // Validate status
        if (status && !VALID_REVIEW_STATUS.includes(status)) {
            return res.status(400).json({
                error: `Invalid role. Must be: ${VALID_REVIEW_STATUS.join(', ')}`
            });
        };
        
        // Prepare update data
        const updateData = {};
        if (message !== undefined) updateData.message = message;
        if (reply !== undefined) updateData.reply = reply;
        if (status !== undefined) updateData.status = status;

        // Update module
        const udpatedDM = await DirectMessage.update(msgID, updateData);

        // Send notification
        sendNotificaDtion(udpatedDM.msgID)

        res.json({
            message: 'Direct message updated successfully',
            dm: udpatedDM
        });

    } catch(error) {
        console.error('Update direct message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCourseMessages = async (req, res) => {
    try {
        const courseID = req.params.courseID;

        // Basic validataion
        if (!courseID) {
            return res.status(400).json({ 
                error: 'Course ID is required' 
            });
        };

        // Validate course ID
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        };
        
        // Get DM
        const dms = await DirectMessage.findByCourseID(courseID);
        
        res.json({
            dms: dms
        });

    } catch (error) {
        console.error('Get course direct message error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getUserMessages = async (req, res) => {
    try {
        const userID = req.params.userID;

        // Basic validataion
        if (!userID) {
            return res.status(400).json({ 
                error: 'User ID is required' 
            });
        };

        // Validate user ID
        const user = await User.findById(userID);
        if (!user || user.role !== 'student') {
            return res.status(400).json({
                error: 'Invalid user ID. Student does not exist.'
            });
        };
        
        // Get DMs
        const dms = await DirectMessage.findByUserID(userID);

        res.json({
            dms: dms
        });
    } catch (error) {
        console.error('Get user posted direct message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getAllReceivedMessages = async (req, res) => {
    try {
        const userID = req.params.userID;

        // Basic validataion
        if (!userID) {
            return res.status(400).json({ 
                error: 'User ID is required' 
            });
        };

        // Validate user ID
        const user = await User.findById(userID);
        if (!user || user.role !== 'course_owner') {
            return res.status(400).json({
                error: 'Invalid user ID. Course owner does not exist.'
            });
        };
        
        // Get DMs
        const dms = await DirectMessage.findByCourseOwner(userID);

        res.json({
            dms: dms
        });
    } catch (error) {
        console.error('Get course owner direct message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const getMessage = async (req, res) => {
    try {
        const msgID = req.params.msgID;

        // Basic validataion
        if (!msgID) {
            return res.status(400).json({ 
                error: 'Message ID is required' 
            });
        };

        // Validate DM
        const dm = await DirectMessage.findById(msgID);
        if (!dm) {
            return res.status(400).json({ 
                error: 'Direct message does not exsist' 
            });
        };

        res.json({
            dm: dm
        });

    } catch (error) {
        console.error('Get direct message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getMeta = (req, res) => {
    res.json({
        status: VALID_REVIEW_STATUS,
    })
}


const sendNotificaDtion = async(msgID) => {
    try {
        const dm = await DirectMessage.findById(msgID);
        console.log(dm)
        if (!dm) {
            throw new Error('Invalid msgID. Direct message not found');
        }

        // trigger notifciation to course owner
        if (!dm.reply) {
            const ownerID = (await Course.findById(dm.courseID)).userID;
            if (!ownerID) {
                throw new Error('Invalid userID. User not found')
            }

            const recipient = await User.findById(ownerID);
            if (!recipient) {
                throw new Error('Invalid userID. Course owner not found.')
            }

            sendDMNotificationToOwner(recipient, dm)
        }

        // trigger notification to student
        if (dm.reply) {
            const recipient = await User.findById(dm.userID);
            if (!recipient) {
                throw new Error('Invalid userID. User not found.')
            }

            sendDMNotificationToStudent(recipient, dm)
        }
    } catch (error) {
        throw new Error('Notification error:', error.message);
    }
}


module.exports = {
  register,
  update,
  getCourseMessages,
  getUserMessages,
  getAllReceivedMessages,
  getMessage,
  getMeta
};