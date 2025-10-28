const { pool } = require('../config/database');

class PomodoroSetting {
    static async create({ userID, isEnabled = true, focusPeriod = '00:25:00', breakPeriod = '00:05:00' }, client = null) {
        const db = client || pool;
        const query = `
            INSERT INTO "tblPomodoroSetting" ("userID", "isEnabled", "focusPeriod", "breakPeriod", "created_at")
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `;
        const result = await db.query(query, [userID, isEnabled, focusPeriod, breakPeriod]);
        return result.rows[0];
    }

    static async update(id, updateData, client = null) {
        const db = client || pool;
        const allowedFields = ['isEnabled', 'focusPeriod', 'breakPeriod'];
        const updates = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`"${key}" = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        updates.push(`"updated_at" = NOW()`);
        values.push(id);

        const query = `
            UPDATE "tblPomodoroSetting"
            SET ${updates.join(', ')}
            WHERE "pomodoroID" = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id, client = null) {
        const db = client || pool;
        const query = `
            SELECT * FROM "tblPomodoroSetting" WHERE "pomodoroID" = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByUserID(userID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblPomodoroSetting" WHERE "userID" = $1`;
        const result = await db.query(query, [userID]);
        return result.rows[0];
    }
}

module.exports = PomodoroSetting;
