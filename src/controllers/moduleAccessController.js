const ModuleAccess = require('../models/ModuleAccess');
const Module = require('../models/Module');
const { pool } = require('../config/database'); // Validate userID

// Register module access
const register = async (req, res) => {
    try {
        const { moduleID, userID, duration } = req.body;

        if (!moduleID || !userID) {
            return res.status(400).json({ error: 'moduleID and userID are required' });
        }

        // Validate module exists
        const module = await Module.findById(moduleID);
        if (!module) return res.status(404).json({ error: 'Module not found' });

        // Validate user exists
        const userResult = await pool.query(`SELECT * FROM "User" WHERE "userID" = $1`, [userID]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const newAccess = await ModuleAccess.create({ moduleID, userID, duration });
        res.json({ message: 'Module access recorded successfully', access: newAccess });
    } catch (error) {
        console.error('Register module access error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all accesses for a user
const getByUser = async (req, res) => {
    try {
        const userID = parseInt(req.params.userid);
        const accesses = await ModuleAccess.findByUserId(userID);
        res.json({ accesses });
    } catch (error) {
        console.error('Get module access error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all accesses for a module
const getByModule = async (req, res) => {
    try {
        const moduleID = parseInt(req.params.moduleid);
        const accesses = await ModuleAccess.findByModuleId(moduleID);
        res.json({ accesses });
    } catch (error) {
        console.error('Get module access error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register, getByUser, getByModule };
