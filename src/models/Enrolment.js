const { pool } = require('../config/database');

class Enrolment {
    static async create({ pathwayID, courseID, userID, status='enrolled' }) {
        const query = `
            INSERT INTO "Enrolment" ("enrolDate", "pathwayID", "courseID", "userID", "status")
            VALUES (NOW(), $1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [pathwayID, courseID, userID, status]);
        return result.rows[0];
    }

    static async findByCourseId(courseID) {
        const query = 'SELECT * FROM "Enrolment" WHERE "courseID" = $1';
        const result = await pool.query(query, [courseID]);
        return result.rows;
    }

    static async findByPathwayId(pathwayID) {
        const query = 'SELECT * FROM "Enrolment" WHERE "pathwayID" = $1';
        const result = await pool.query(query, [pathwayID]);
        return result.rows;
    }

    static async findByUserID(userID) {
        const query = 'SELECT * FROM "Enrolment" WHERE "userID" = $1';
        const result = await pool.query(query, [userID]);
        return result.rows;
    }

    static async findById(id) {
        const query = `
            SELECT * FROM "Enrolment" WHERE "enrolmentID" = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByCourseIdUserID(courseID, userID) {
        const query = `
            SELECT * FROM "Enrolment" WHERE "courseID" = $1 AND "userID" = $2
        `;
        const result = await pool.query(query, [courseID, userID]);
        return result.rows[0];
    }

    static async findByPathwayIdUserID(pathwayID, userID) {
        const query = `
            SELECT * FROM "Enrolment" WHERE "pathwayID" = $1 AND "userID" = $2
        `;
        const result = await pool.query(query, [pathwayID, userID]);
        return result.rows;
    }
    
    static async update(id, updateData) {
        const allowedFields = ['pathwayID', 'status'];
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

        if(updates.status === 'disenrolled') {
            updates.push(`"disenrolledDate" = NOW()`);
        }

        if(updates.status === 'completed') {
            updates.push(`"completionDate" = NOW()`);
        }

        updates.push(`"updated_at" = NOW()`);
        values.push(id);

        const query = `
            UPDATE "Enrolment"
            SET ${updates.join(', ')}
            WHERE "enrolmentID" = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getPopularCourses() {
        const query =`
            SELECT e."courseID", c."title", c."category", c."level", COUNT(e."userID") "count" FROM "Enrolment" e
            LEFT JOIN "Course" c ON e."courseID" = e."courseID"
            WHERE NOT e."status" = 'disenrolled'
            GROUP BY e."courseID", c."title", c."category", c."level"
            ORDER BY "count" DESC
            LIMIT 3
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    static async getPopularPathways() {
        const query =`
            SELECT e."pathwayID", p."name", COUNT(e."userID") "count" FROM "Enrolment" e
            LEFT JOIN "Pathway" p ON e."courseID" = e."courseID"
            WHERE NOT e."pathwayID" = NULL AND NOT e."status" = 'disenrolled'
            GROUP BY e."pathwayID", p."name"
            ORDER BY "count" DESC
            LIMIT 3
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    static async getUserEnrolledPathways(userID) {
        const query =`
            SELECT DISTINCT("pathwayID")
            FROM "Enrolment"
            WHERE "userID" = $1 AND NOT "status" = 'disenrolled'
        `

        const result = await pool.query(query, [userID]);
        return result.rows;
    }


    static async getAll() {
        const query = `
            SELECT * FROM "Enrolment" ORDER BY "enrolDate" DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

}

module.exports = Enrolment;
