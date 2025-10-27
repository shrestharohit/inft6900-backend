const PomodoroSetting = require('../models/PomodoroSetting');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { userID } = req.body;

        newSetting = await initialisePomodoro(userID);
        res.json({
            message: 'Pomodoro setting created successfully',
            pomodoroSetting: newSetting
        })
    } catch(error) {
        console.error('Pomodoro setting create error:', error);
        res.status(500).json({ error: 'Error occured while creating pomodoro setting. ' + error});
    }
};

const update = async (req, res) => {
    try {
        const userID = req.params.userID;
        const { isEnabled, focusPeriod, breakPeriod } = req.body;

        // Basic validataion
        if (!userID) {
            return res.status(400).json({ 
                error: 'User ID and settings are required' 
            });
        };

        // Validate user ID
        const user = await User.findById(userID);
        if (!user || user.role !== 'student') {
            return res.status(400).json({
                error: 'Student not found.'
            });
        };

        // Get existing settings
        const setting = await PomodoroSetting.findByUserID(userID)

        // Prepare update data
        const updateData = {};
        if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
        if (focusPeriod !== undefined) updateData.focusPeriod = focusPeriod;
        if (breakPeriod !== undefined) updateData.breakPeriod = breakPeriod;

        // Save settings
        const updatedSettings = await PomodoroSetting.update(setting.pomodoroID, updateData);

        res.json({
            message: 'Pomodoro setting updated successfully',
            pomodoroSetting: updatedSettings
        })


    } catch(error) {
        console.error('Pomodoro setting update error:', error);
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

        // Validate user ID
        const user = await User.findById(userID);
        if (!user || user.role !== 'student') {
            return res.status(400).json({
                error: 'Student not found.'
            });
        };

        const setting = await PomodoroSetting.findByUserID(userID);
        res.json(setting);
    } catch (error) {
        console.error('Get pomodoro setting error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const initialisePomodoro = async (userID) => {
    // Basic validataion
    if (!userID) {
        throw new Error('User ID is  required');
    }

    // Validate user ID
    const user = await User.findById(userID);
    if (!user || user.role !== 'student') {
        throw new Error('Student not found.');
    }

    // Check if setting already exists
    const exists = !!(await PomodoroSetting.findByUserID(userID))
    if (exists) {
        throw new Error('Pomodoro setting already initialised.');
    }

    const newSetting = await PomodoroSetting.create({userID});
    return newSetting;
}


module.exports = {
    register,
    update,
    getUserSettings,
    initialisePomodoro
};