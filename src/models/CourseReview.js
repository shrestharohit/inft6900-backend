const { pool } = require('../config/database');

class CourseReview {
    static async create({ userID, courseID, comment, rating }, client = null) {
        const db = client || pool;
        const query = `
            INSERT INTO "CourseReview" ("userID", "courseID", "comment", "rating", "status", "created_at")
            VALUES ($1, $2, $3, $4, 'active', NOW())
            RETURNING *
        `;
        const result = await db.query(query, [userID, courseID, comment, rating]);
        return result.rows[0];
    }

    static async update(id, updateData, client = null) {
        const db = client || pool;
        const allowedFields = ['comment', 'rating', 'status'];
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
            UPDATE "CourseReview"
            SET ${updates.join(', ')}
            WHERE "reviewID" = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, u."firstName", u."lastName" FROM "CourseReview" r
            LEFT JOIN "User" u ON u."userID" = r."userID"
            WHERE r."reviewID" = $1 AND r."status" = ANY($2)
        `;
        const result = await db.query(query, [id, status]);
        return result.rows[0];
    }

    static async findByCourseID(courseID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, u."firstName", u."lastName" FROM "CourseReview" r
            LEFT JOIN "User" u ON u."userID" = r."userID"
            WHERE r."courseID" = $1 AND r."status" = ANY($2)`;
        const result = await db.query(query, [courseID, status]);
        return result.rows;
    }

    static async getAvgRatings(courseID, client = null) {
        const db = client || pool;
        const query = `
            SELECT c."courseID", c."title", ROUND(AVG(r."rating"),1) as "AvgRating"
            FROM "CourseReview"  r
            LEFT JOIN "Course" c ON r."courseID" = c."courseID"
            WHERE c."courseID" = $1 AND r."status" = 'active'
            GROUP BY c."courseID", c."title"
        `;
        const result = await db.query(query, [courseID]);
        return result.rows[0];
    }

    static async getAvgCourseOwnerRatings(userID, client = null) {
        const db = client || pool;
        const query = `
            SELECT c."userID", ROUND(AVG(r."rating"),1) as "AvgRating"
            FROM "CourseReview"  r
            LEFT JOIN "Course" c ON r."courseID" = c."courseID"
            WHERE c."userID" = $1 AND r."status" = 'active'
            GROUP BY c."userID"
        `;
        const result = await db.query(query, [userID]);
        return result.rows[0];
    }

    static async findByUserID(userID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, u."firstName", u."lastName" FROM "CourseReview" r
            LEFT JOIN "User" u ON u."userID" = r."userID"
            WHERE r."userID" = $1 AND r."status" = ANY($2)`;
        const result = await db.query(query, [userID, status]);
        return result.rows;
    }

    static async findByUserIDCourseID(userID, courseID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT * FROM "CourseReview" r
            LEFT JOIN "User" u ON u."userID" = r."userID"
            WHERE r."userID" = $1 AND r."courseID" = $2 AND r."status" = ANY($3)`;
        const result = await db.query(query, [userID, courseID, status]);
        return result.rows;
    }

    static async getTopReviews(client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, c."courseID", c."title", u."userID", u."firstName", u."lastName"
            FROM "CourseReview" r
            LEFT JOIN "Course" c ON r."courseID" = c."courseID"
            LEFT JOIN "User" u ON r."userID" = u."userID"
            WHERE r."rating" = 5 AND r."status" = 'active'
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = CourseReview;
