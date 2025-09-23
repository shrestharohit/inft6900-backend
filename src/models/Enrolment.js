const { pool } = require('../config/database');

class Enrolment {
    // Pathway to be added in Sprint 2
    static async create({ pathwayID, courseID, studentID, status='enrolled' }) {
        const query = `
            INSERT INTO "Module" ("enrolDate", "pathwayID", "courseID", "studentID", "status")
            VALUES (NOW(), $1, $2, $3, $4)
            RETURNING "moduleID", "courseID", "title", "description", "moduleNumber", "expectedHours", "status"
        `;
        const result = await pool.query(query, [courseID, title, description, moduleNumber, expectedHours, status]);
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

    static async findByStudentID(studentID) {
        const query = 'SELECT * FROM "Enrolment" WHERE "studentID" = $1';
        const result = await pool.query(query, [studentID]);
        return result.rows;
    }

    static async findById(id) {
        const query = `
            SELECT * FROM "Enrolment" WHERE "enrolmentID" = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByCourseIdMStudentId(courseID, studentID) {
        const query = `
            SELECT * FROM "Module" WHERE "courseID" = $1 AND "studentID" = $2
        `;
        const result = await pool.query(query, [courseID, studentID]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const allowedFields = ['pathwayID', 'status', 'completionDate', 'disenrolledDate'];
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
            UPDATE "Enrolment"
            SET ${updates.join(', ')}
            WHERE "moduleID" = $${paramCount}
            RETURNING "pathwayID", "status", "completionDate", "disenrolledDate", "updated_at"
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
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
