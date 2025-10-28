const { pool } = require('../config/database');

class NotificationSetting {
    static async create({ userID, notificationType, enabled = true }, client = null) {
        const db = client || pool;
        const query = `
            INSERT INTO "tblNotificationSetting" ("userID", "notificationType", "enabled", "created_at")
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `;
        const result = await db.query(query, [userID, notificationType, enabled]);
        return result.rows[0];
    }

    static async update(id, updateData, client = null) {
        const db = client || pool;
        const allowedFields = ['enabled'];
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
            UPDATE "tblNotificationSetting"
            SET ${updates.join(', ')}
            WHERE "settingID" = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id, client = null) {
        const db = client || pool;
        const query = `
            SELECT * FROM "tblNotificationSetting" WHERE "settingID" = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByUserIDType(userID, notificationType, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblNotificationSetting" WHERE "userID" = $1 AND "notificationType" = $2`;
        const result = await db.query(query, [userID, notificationType]);
        return result.rows;
    }

    static async findByUserID(userID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblNotificationSetting" WHERE "userID" = $1`;
        const result = await db.query(query, [userID]);
        return result.rows;
    }

    static async getEnabledNotifications(userID, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblNotificationSetting" WHERE "userID" = $1 AND "enabled" = TRUE`;
        const result = await db.query(query, [userID]);
        return result.rows;
    }

    static async getEnabledUsers(notificationType, client = null) {
        const db = client || pool;
        const query = `SELECT * FROM "tblNotificationSetting" WHERE "notificationType" = $1 AND "enabled" = TRUE`;
        const result = await db.query(query, [notificationType]);
        return result.rows;
    }
}

module.exports = NotificationSetting;
