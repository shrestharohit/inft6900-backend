const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const AnswerOption = require('../models/AnswerOption');
const { VALID_QUIZ_STATUS } = require('../config/constants');
const {
    registerQuestion,
    updateQuestion,
    inactivateQuestion,
} = require('./questionController')

const { pool } = require('../config/database');


// To shorten the API route, use module ID to get the quiz.
// Each module can only have 1 quiz, so this works.

const register = async (req, res) => {
    try {
        const { courseID, moduleNumber } = req.params;
        const { title, timeLimit, status, questions } = req.body;

        // Validate course id is provided
        if (!moduleNumber) {
            return res.status(400).json({ 
                error: 'Module number is required.' 
            });
        };

        // Basic validataion
        if (!title || !status || !questions ) {
            return res.status(400).json({
                error: 'Title, status and questions are required'
            });
        };

        // Validate status
        const quizStatus = status || 'draft';
        if (!VALID_QUIZ_STATUS.includes(quizStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUIZ_STATUS.join(', ')} `
            });
        };

        // Validate module ID
        const quizModule = await Module.findByCourseIdModuleNumber(courseID, moduleNumber);
        if (!quizModule) {
            return res.status(400).json({
                error: 'Invalid course ID and module number. Module not found.'
            });
        };

        // Check if there is already a quiz created for the module
        const exists = !!(await Quiz.findByModule(quizModule.moduleID));
        if (exists) {
            return res.status(400).json({
                error: 'Quiz already exists. Each module can only have 1 quiz.'
            });
        }

        // Create Quiz
        const newQuiz = await Quiz.create({
            moduleID: quizModule.moduleID, 
            title,
            timeLimit, 
            status: quizStatus
        });

        // try creating questions
        const newQuestions = []
        for (const question of questions) {
            try {
                const newQuestion = await registerQuestion(newQuiz, question);
                newQuestions.push(newQuestion);
            } catch (error) {
                // delete created quiz
                Quiz.delete(newQuiz.quizID);

                console.error('Question registration error:', error.message);
                return res.status(400).json({
                    error: error.message
                });
            }
        };

        res.json({
            message: 'Quiz registered successfully',
            quiz: {
                quizID: newQuiz.quizID,
                moduleID: newQuiz.moduleID,
                title: newQuiz.title,
                timeLimit: newQuiz.timeLimit,
                status: newQuiz.status,
                quiestions: newQuestions,
                created_at: newQuiz.created_at
            }
        })


    } catch(error) {
        res.status(500).json({ error: `Registration error:{$error.message}`  });
        
    }
};


const update = async (req, res) => {
    const client = await pool.connect();
    await client.query('BEGIN')

    try {
        const { courseID, moduleNumber } = req.params;
        const { title, timeLimit, status, questions } = req.body;

        // Validate course number is provided
        if (!moduleNumber) {
            return res.status(400).json({ 
                error: 'Module number is required.' 
            });
        };

        // Validate module number and course ID
        const existingModule = await Module.findByCourseIdModuleNumber(courseID, moduleNumber, client);
        if (moduleNumber !== undefined && !existingModule) {
            return res.status(404).json({
                error: 'Invalid course ID and module number. Module not found.'
            });
        }

        // Check if quiz under the selected module exists
        const existingQuiz = await Quiz.findByModule(existingModule.moduleID, client);
        if (!existingQuiz) {
            return res.status(404).json({
                error: 'Quiz not found'
            });
        };

        // Validate status
        const quizStatus = status;
        if (quizStatus !== undefined && !VALID_QUIZ_STATUS.includes(quizStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUIZ_STATUS.join(', ')} `
            });
        };

        // Validate question's data type
        if (!Array.isArray(questions)) {
            return res.status(400).json({ error: 'Questions must be an array.' });
        }
        
        // Try updating questions first
        const questionNumbers = (await Question.findByQuizId(existingQuiz.quizID, client)).map(q => q.questionNumber);
        for (const number of questionNumbers) {
            if (!questions.map(q => q.questionNumber).includes(number)) {
                const deletedQuestion = await Question.findByQuizIdQuestionNumber(existingQuiz.quizID, number, client);
                await inactivateQuestion(deletedQuestion, client);
            }
        }
        
        const updatedQuestions = [];
        try {
            for (const question of questions) {
                const updatedQuestion = await updateQuestion(existingQuiz, question, client);
                updatedQuestions.push(updatedQuestion);
            }
        } catch(error) {
            console.error('Question update error:', error.message);
            return res.status(400).json({
                error: error.message
            });
        };

        // Prepare update data
        const updateData = {};
        const quizID = existingQuiz.quizID;
        if (title !== undefined) updateData.title = title;
        if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
        if (status !== undefined) updateData.status = quizStatus;

        // Update module
        const updateQuiz = await Quiz.update(quizID, updateData, client);
        await client.query('COMMIT');

        res.json({
            message: 'Quiz updated successfully',
            quiz: {
                quizID: updateQuiz.quizID,
                moduleID: updateQuiz.moduleID,
                title: updateQuiz.title,
                timeLimit: updateQuiz.timeLimit,
                status: updateQuiz.status,
                questions: updatedQuestions,
                udpated_at: updateQuiz.udpated_at
            }
        });

    } catch(error) {
        await client.query('ROLLBACK');
        console.error('Update quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

const getQuiz = async (req, res) => {
    try {
        // To shorten the API route, use module ID to get the quiz.
        // Each module can only have 1 quiz, so this works.
        const moduleNumber = req.params.moduleNumber;
        const courseID = req.params.courseID;

        // Validate course ID and module Number
        const module = await Module.findByCourseIdModuleNumber(courseID, moduleNumber);
        if (!module) {
            return res.status(400).json({
                error: 'Invalid course ID and module number. Module not found.'
            });
        };

        // Check if quiz is already created for the module
        const quiz = await Quiz.findByModule(module.moduleID);
        if (!quiz) {
            return res.status(400).json({
                error: 'Quiz not found.'
            });
        }

        res.json(quiz);
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const getMeta = (req, res) => {
    res.json({
        status: VALID_QUIZ_STATUS,
    })
}


module.exports = {
  register,
  update,
  getQuiz,
  getMeta,
};