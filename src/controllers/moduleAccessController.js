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
        const userResult = await pool.query(`SELECT * FROM "tblUser" WHERE "userID" = $1`, [userID]);
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

// Get last access date for a user in a module
const getLastAccess = async (req, res) => {
    try {
        const moduleID = parseInt(req.params.moduleid);
        const userID = parseInt(req.params.userid);

        const lastAccess = await ModuleAccess.findLastAccess(moduleID, userID);
        if (!lastAccess) {
            return res.status(404).json({ error: 'No access record found' });
        }

        res.json({ moduleID, userID, lastAccessDate: lastAccess.accessDate });
    } catch (error) {
        console.error('Get last access error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all accesses for a user in a module
const getAllAccesses = async (req, res) => {
    try {
        const moduleID = parseInt(req.params.moduleid);
        const userID = parseInt(req.params.userid);

        const accesses = await ModuleAccess.findAllAccesses(moduleID, userID);
        res.json({ moduleID, userID, accesses });
    } catch (error) {
        console.error('Get all accesses error:', error);
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
}

module.exports = { register, getByUser, getByModule, getLastAccess, getAllAccesses };

