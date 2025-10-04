const NotificationSetting = require('../models/NotificationSetting');
const User = require('../models/User');
const { VALID_NOTIFICATIONSETTING_TYPE } = require('../config/constants');

const saveSettings = async (req, res) => {
    try {
        const { userID, settings } = req.body;

        // Basic validataion
        if (!userID || !settings) {
            return res.status(400).json({ 
                error: 'User ID and settings are required' 
            });
        };

        // Validate user ID
        const user = await User.findById(userID);
        if (!user) {
            return res.status(400).json({
                error: 'Invalid user ID. User does not exist.'
            });
        };

        // Validate settings
        if (typeof settings !== 'object' || settings.constructor !== Object) {
            return res.status(400).json({
                error: 'Invalid settings. Settings must be an object.'
            });
        };

        // Get existing settings
        const existingSettings = await NotificationSetting.findByUserID(userID)

        // Save settings
        for (const type of Object.keys(VALID_NOTIFICATIONSETTING_TYPE)) {
            if (existingSettings[type] !== undefined && !Object.keys(settings).includes(type)) {
                break;
            }

            let registeringSetting = true;

            if (Object.keys(settings).includes(type)) {
                registeringSetting = settings[type];
            } else {
                registeringSetting = true;
            }

            if (existingSettings[type] === undefined) {
                await NotificationSetting.create({
                    userID: userID, 
                    notificationType: type, 
                    enabled: registeringSetting
                })
            } else {
                await NotificationSetting.update(userID, type, registeringSetting)
            }
        }
        
        const updatedSettings = (await NotificationSetting.findByUserID(userID)).map(
            item => ({
                ...item,
                notificationTypeName: VALID_NOTIFICATIONSETTING_TYPE[item.notificationType]
            })
        )

        res.json({
            message: 'Notification settings saved successfully',
            notificationSetting: updatedSettings
        })


    } catch(error) {
        console.error('Notification settings save error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserSettings = async (req, res) => {
    try {
        const userID = req.params.userID;

        // Basic validataion
        if (!userID) {
            return res.status(400).json({ 
                error: 'User ID is required' 
            });
        };

        const setting = await NotificationSetting.findByUserID(userID);

        const processedData = setting.map(
            item => ({
                ...item,
                notificationTypeName: VALID_NOTIFICATIONSETTING_TYPE[item.notificationType]
            })
        )
        
        res.json(processedData);

    } catch (error) {
        console.error('Get notification setting error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getMeta = (req, res) => {
    res.json({
        notificationType: VALID_NOTIFICATIONSETTING_TYPE,
    })
}

const setInitialSettings = async (userID) => {
    // Basic validataion
    if (!userID) {
        throw new Error('User ID is requried');
    };

    const user = User.findById(userID)
    if (!user) {
        throw new Error('User not found');
    }

    // Get existing settings
    const existingSettings = await NotificationSetting.findByUserID(userID)

    for (const type of Object.keys(VALID_NOTIFICATIONSETTING_TYPE)) {
        if (existingSettings[type] === undefined) {
            await NotificationSetting.create({
                userID: userID, 
                notificationType: type, 
                enabled: true
            })
        } else {
            await NotificationSetting.update(userID, type, true)
        }
    }
}


const getNotificationReceivers = async (notificationType, users = null) => {
    if (!Object.keys(VALID_NOTIFICATIONSETTING_TYPE).includes(notificationType)) {
        throw new Error('Invalid notification type given');
    }

    let enabledUsers = await NotificationSetting.getEnabledUsers(notificationType);

    if (!users) {
        return enabledUsers;
    }

    const filteredBy = new Set(users.map(user => user.userID));
    const filteredUsers = enabledUsers.filter(user => filteredBy.has(user.userID));

    enabledUsers = await Promise.all(
        filteredUsers.map(user => User.findById(user.userID))
    )

    return enabledUsers;
}

module.exports = {
  saveSettings,
  getUserSettings,
  getMeta,
  getNotificationReceivers,
  setInitialSettings
};