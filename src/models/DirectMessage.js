const { pool } = require('../config/database');

class DirectMessage {
    static async create({ userID, courseID, message }, client = null) {
        const db = client || pool;
        const query = `
            INSERT INTO "DirectMessage" ("userID", "courseID", "message", "status", "created_at")
            VALUES ($1, $2, $3, 'active', NOW())
            RETURNING *
        `;
        const result = await db.query(query, [userID, courseID, message]);
        return result.rows[0];
    }

    static async update(id, updateData, client = null) {
        const db = client || pool;
        const allowedFields = ['message', 'reply', 'status'];
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
            UPDATE "DirectMessage"
            SET ${updates.join(', ')}
            WHERE "msgID" = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT d.*, c."title", u."firstName", u."lastName" FROM "DirectMessage"  d
            LEFT JOIN "Course" c ON d."courseID" = c."courseID"
            LEFT JOIN "User" u ON d."userID" = u."userID"
            WHERE d."msgID" = $1 AND d."status" = ANY($2)
        `;
        const result = await db.query(query, [id, status]);
        return result.rows[0];
    }

    static async findByCourseID(courseID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT d.*, c."title", u."firstName", u."lastName" FROM "DirectMessage"  d
            LEFT JOIN "Course" c ON d."courseID" = c."courseID"
            LEFT JOIN "User" u ON d."userID" = u."userID"
            WHERE d."courseID" = $1 AND d."status" = ANY($2)
        `;
        const result = await db.query(query, [courseID, status]);
        return result.rows;
    }

    static async findByUserID(userID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT d.*, c."title", u."firstName", u."lastName" FROM "DirectMessage"  d
            LEFT JOIN "Course" c ON d."courseID" = c."courseID"
            LEFT JOIN "User" u ON d."userID" = u."userID"
            WHERE d."userID" = $1 AND d."status" = ANY($2)
        `;
        const result = await db.query(query, [userID, status]);
        return result.rows;
    }

    static async findByUserIDCourseID(userID, courseID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT d.*, c."title", u."firstName", u."lastName" FROM "DirectMessage"  d
            LEFT JOIN "Course" c ON d."courseID" = c."courseID"
            LEFT JOIN "User" u ON d."userID" = u."userID"
            WHERE d."userID" = $1 AND d."courseID" = $2 d."status" = ANY($3)
        `;
        const result = await db.query(query, [userID, courseID, status]);
        return result.rows;
    }
    
    static async findByCourseOwner(userID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT d.*, c."title", u."firstName", u."lastName" FROM "DirectMessage"  d
            LEFT JOIN "Course" c ON d."courseID" = c."courseID"
            LEFT JOIN "User" u ON d."userID" = u."userID"
            WHERE c."userID" = $1 AND d."status" = ANY($2)
        `;
        const result = await db.query(query, [userID, status]);
        return result.rows;
    }
}

module.exports = DirectMessage;
