const { pool } = require('../config/database');

class ModuleAccess {
    // Record new module access
    static async create({ moduleID, userID, duration }) {
        const query = `
            INSERT INTO "ModuleAccess" ("moduleID", "userID", "duration", "accessDate")
            VALUES ($1, $2, $3, NOW())
            RETURNING "accessID", "moduleID", "userID", "duration", "accessDate"
        `;
        const result = await pool.query(query, [moduleID, userID, duration]);
        return result.rows[0];
    }

    // Get all accesses for a user
    static async findByUserId(userID) {
        const query = `SELECT * FROM "ModuleAccess" WHERE "userID" = $1 ORDER BY "accessDate" DESC`;
        const result = await pool.query(query, [userID]);
        return result.rows;
    }

    // Get all accesses for a module
    static async findByModuleId(moduleID) {
        const query = `SELECT * FROM "ModuleAccess" WHERE "moduleID" = $1 ORDER BY "accessDate" DESC`;
        const result = await pool.query(query, [moduleID]);
        return result.rows;
    }

    // Get single access record by ID
    static async findById(accessID) {
        const query = `SELECT * FROM "ModuleAccess" WHERE "accessID" = $1`;
        const result = await pool.query(query, [accessID]);
        return result.rows[0];
    }
}

module.exports = ModuleAccess;
