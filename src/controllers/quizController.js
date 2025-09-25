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
        const { moduleID, title, timeLimit, status, questions } = req.body;

        // Basic validataion
        if (!moduleID || !title || !questions ) {
            return res.status(400).json({
                error: 'Module ID, title, status and questions are required'
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
        const quizModule = await Module.findById(moduleID);
        if (!quizModule) {
            return res.status(400).json({
                error: 'Invalid module ID. Module not found.'
            });
        };

        // Check if there is already a quiz created for the module
        const exists = !!(await Quiz.findByModuleID(quizModule.moduleID));
        if (exists) {
            return res.status(400).json({
                error: 'Quiz already exists. Each module can only have 1 quiz.'
            });
        }

        // Create Quiz
        const newQuiz = await Quiz.create({
            moduleID: moduleID, 
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
                questions: newQuestions,
                created_at: newQuiz.created_at
            }
        })


    } catch(error) {
        res.status(500).json({ error: `Registration error:${error.message}`  });
    }
};


const update = async (req, res) => {
    const client = await pool.connect();
    await client.query('BEGIN')

    try {
        const { quizID } = req.params;
        const { moduleID, title, timeLimit, status, questions } = req.body;

        
        // Check if quiz exists
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        };

        // Check if quiz under the selected module exists
        if (moduleID !== quiz.moduleID) {
            const existingQuiz = await Quiz.findByModuleID(moduleID, client);
            if (existingQuiz) {
                return res.status(400).json({
                    error: 'Quiz already exists. Each module can only have 1 quiz.'
                });
            }
        }

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
        };

        // any missing question will be treated as deleted (inactive)
        const questionNumbers = (await Question.findByQuizId(quiz.quizID, client)).map(q => q.questionNumber);
        for (const number of questionNumbers) {
            if (!questions.map(q => q.questionNumber).includes(number)) {
                const deletedQuestion = await Question.findByQuizIdQuestionNumber(quiz.quizID, number, client);
                await inactivateQuestion(deletedQuestion, client);
            };
        };

        // Try updating questions
        const updatedQuestions = [];
        try {
            for (const question of questions) {
                if (question.questionID) {
                    const updatedQuestion = await updateQuestion(quiz, question, client);
                    updatedQuestions.push(updatedQuestion);
                } else {
                    const newQuestion = await registerQuestion(quiz, question, client);
                    updatedQuestions.push(newQuestion);
                }
            }
        } catch(error) {
            console.error('Question update error:', error.message);
            return res.status(400).json({
                error: error.message
            });
        };

        // Prepare update data
        const updateData = {};
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
                updated_at: updateQuiz.updated_at
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
        const quizID = req.params.quizID;

        // Check if quiz is already created for the module
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        }

        res.json(quiz);
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const getDetail = async (req, res) => {
    try {
        const quizID = req.params.quizID;

        // Check if quiz is already created for the module
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        }

        // Get all questions and options
        const questions = await Question.findByQuizId(quizID);
        const questionList = []
        for (question of questions) {
            const options = await AnswerOption.findByQuestionID(question.questionID);
            question['options'] = options;
            questionList.push(question);
        }

        quiz['questions'] = questionList;

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
  getDetail,
  getMeta,
};