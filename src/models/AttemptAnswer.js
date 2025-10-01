const { pool } = require('../config/database');

class AttemptAnswer {
    static async create({ attemptID, questionID, optionID }, client) {
        const db = client || pool;
        let query = '';
        if (!optionID) {
            query = `
            INSERT INTO "AttemptAnswer" ("attemptID", "questionID", "optionID", "isCorrect")
            VALUES($1, $2, $3, false)
            RETURNING *
            `;
        } else {
            query = `
            INSERT INTO "AttemptAnswer" ("attemptID", "questionID", "optionID", "isCorrect")
            SELECT 
                $1 AS "attemptID", 
                $2 AS "questionID",
                $3 AS "optionID",
                ao."isCorrect"
            FROM "AnswerOption" ao
            WHERE ao."optionID" = $3
            RETURNING *
            `;
        }

        const result = await db.query(query, [attemptID, questionID, optionID]);
        return result.rows[0];
    }

    static async findById(attemptAnswerID, client = null) {
        const db = client || pool;
        const query = `
        SELECT aa.*, ao."feedbackText" 
        FROM "AttemptAnswer" aa
        LEFT JOIN "AnswerOption" ao ON aa."questionID" = ao."questionID"
        WHERE "attemptAnswerID" = $1
        `;
        const result = await db.query(query, [attemptAnswerID]);
        return result.rows[0];
    }

    static async findByAttemptID(attemptID, client = null) {
        const db = client || pool;
        const query = `
        SELECT aa.*, ao."feedbackText" 
        FROM "AttemptAnswer" aa
        LEFT JOIN "AnswerOption" ao ON aa."questionID" = ao."questionID" AND aa."optionID" = ao."optionID"
        WHERE "attemptID" = $1`;
        const result = await db.query(query, [attemptID]);
        return result.rows;
    }

    static async findByUserModule(userID, moduleID, client = null) {
        const db = client || pool;
        const query = `
        SELECT aa.*, ao."feedbackText" 
        FROM "AttemptAnswer" aa
        LEFT JOIN "AnswerOption" ao ON aa."questionID" = ao."questionID"
        LEFT JOIN "QuizAttempt" qa ON aa."attemptID" ON qa."attemptID"
        LEFT JOIN "Quiz" q ON a."quizID" = q."quizID"
        LEFT JOIN "Module" m ON m."moduleID" = q."moduleID"
        LEFT JOIN "Enrolment" e ON m."courseID" = e."courseID"
        WHERE e."userID" = $1 AND m."moduleID" = $2
        `;
        const result = await db.query(query, [userID, moduleID]);
        return result.rows;
    }

    static async findByUserCourse(userID, courseID, client = null) {
        const db = client || pool;
        const query = `
        SELECT aa.*, ao."feedbackText" 
        FROM "AttemptAnswer" aa
        LEFT JOIN "AnswerOption" ao ON aa."questionID" = ao."questionID"
        LEFT JOIN "QuizAttempt" qa ON aa."attemptID" ON qa."attemptID"
        LEFT JOIN "Quiz" q ON a."quizID" = q."quizID"
        LEFT JOIN "Module" m ON m."moduleID" = q."moduleID"
        LEFT JOIN "Enrolment" e ON m."courseID" = e."courseID"
        WHERE e."userID" = $1 AND m."moduleID" = $2
        `;
        const result = await db.query(query, [userID, courseID]);
        return result.rows;
    }

}

module.exports = AttemptAnswer;
