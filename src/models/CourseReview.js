const { pool } = require('../config/database');

class CourseReview {
    static async create({ enrolmentID, comment, rating }, client = null) {
        const db = client || pool;
        const query = `
            INSERT INTO "tblCourseReview" ("enrolmentID", "comment", "rating", "status", "created_at")
            VALUES ($1, $2, $3, 'active', NOW())
            RETURNING *
        `;
        const result = await db.query(query, [enrolmentID, comment, rating]);
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
            UPDATE "tblCourseReview"
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
            SELECT r.*, e."userID", u."firstName", u."lastName", e."courseID", c."title" FROM "tblCourseReview" r
            LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = r."enrolmentID"
            LEFT JOIN "tblCourse" c ON c."courseID" = e."courseID"
            LEFT JOIN "tblUser" u ON e."userID" = u."userID" 
            WHERE r."reviewID" = $1 AND r."status" = ANY($2)
        `;
        const result = await db.query(query, [id, status]);
        return result.rows[0];
    }

    static async findByCourseID(courseID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, c."title", u."firstName", u."lastName" FROM "tblCourseReview" r
            LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = r."enrolmentID"
            LEFT JOIN "tblCourse" c ON c."courseID" = e."courseID"
            LEFT JOIN "tblUser" u ON e."userID" = u."userID" 
            WHERE e."courseID" = $1 AND r."status" = ANY($2)`;
        const result = await db.query(query, [courseID, status]);
        return result.rows;
    }

    static async findByCourses(courseIDs, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, c."title", u."firstName", u."lastName" FROM "tblCourseReview" r
            LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = r."enrolmentID"
            LEFT JOIN "tblCourse" c ON c."courseID" = e."courseID"
            LEFT JOIN "tblUser" u ON e."userID" = u."userID" 
            WHERE e."courseID" = ANY($1) AND r."status" = ANY($2)`;
        const result = await db.query(query, [courseIDs, status]);
        return result.rows;
    }

    static async findByPathwayID(courseID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, c."title" FROM "tblCourseReview" r
            LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = r."enrolmentID"
            LEFT JOIN "tblCourse" c ON c."courseID" = e."courseID"
            WHERE c."pathwayID" = $1 AND r."status" = ANY($2)`;
        const result = await db.query(query, [courseID, status]);
        return result.rows;
    }

    static async getAvgRatings(courseID, client = null) {
        const db = client || pool;
        const query = `
            SELECT c."courseID", c."title", ROUND(AVG(r."rating"),1) as "AvgRating"
            FROM "tblCourseReview"  r
            LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = r."enrolmentID"
            LEFT JOIN "tblCourse" c ON c."courseID" = e."courseID"
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
            FROM "tblCourseReview"  r
            LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = r."enrolmentID"
            LEFT JOIN "tblCourse" c ON c."courseID" = e."courseID"
            WHERE c."userID" = $1 AND r."status" = 'active'
            GROUP BY c."userID"
        `;
        const result = await db.query(query, [userID]);
        return result.rows[0];
    }

    static async findByUserID(userID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, u."firstName", u."lastName" FROM "tblCourseReview" r
            LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = r."enrolmentID"
            LEFT JOIN "tblUser" u ON u."userID" = e."userID"
            WHERE r."userID" = $1 AND r."status" = ANY($2)`;
        const result = await db.query(query, [userID, status]);
        return result.rows;
    }

    static async findByEnrolmentID(enrolmentID, status = ["active"], client = null) {
        const db = client || pool;
        const query = `
            SELECT * FROM "tblCourseReview" r
            WHERE r."enrolmentID" = $1 AND r."status" = ANY($2)`;
        const result = await db.query(query, [enrolmentID, status]);
        return result.rows;
    }

    static async getTopReviews(client = null) {
        const db = client || pool;
        const query = `
            SELECT r.*, c."courseID", c."title", u."userID", u."firstName", u."lastName"
            FROM "tblCourseReview" r
            LEFT JOIN "tblEnrolment" e ON e."enrolmentID" = r."enrolmentID"
            LEFT JOIN "tblUser" u ON u."userID" = e."userID"
            LEFT JOIN "tblCourse" c ON c."courseID" = e."courseID"
            WHERE r."rating" = 5 AND r."status" = 'active'
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = CourseReview;
