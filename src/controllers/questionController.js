const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { VALID_QUESTION_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const quizID = req.params.quizID;
        const { questionNumber, questionText, status } = req.body;

        // Validate quiz id is provided
        if (!quizID) {
            return res.status(400).json({ 
                error: 'Quiz ID is required in header (quizID) or query parameter (quizID)'
            });
        }

        // Validate module ID
        const questionQuiz = await Quiz.findById(quizID);
        if (!questionQuiz) {
            return res.status(400).json({
                error: 'Invalid quiz ID. Quiz does not exist.'
            });
        }

        // Basic validataion
        if (!questionNumber || !questionText || !status) {
            return res.status(400).json({
                error: 'Question number, question text and status are required'
            });
        }

        // Validate if question number is already used in the same quiz
        const existingQuestionNumber = await Question.findByQuizIdQuestionNumber(quizID, questionNumber);
        if (existingQuestionNumber) {
            return res.status(400).json({
                error: 'Selected quiz number already used in the selected course'
            });
        }

        // Validate status
        const questionStatus = status || 'active';

        if (!VALID_QUESTION_STATUS.includes(questionStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUESTION_STATUS.join(', ')} `
            });
        }

        // Create course
        const newQuestion = await Question.create({
            quizID, 
            questionNumber, 
            questionText, 
            status
        });

        res.json({
            message: 'Question registered successfully',
            module: {
                questionID: newQuestion.questionID,
                quizID: newQuestion.quizID,
                questionNumber: newQuestion.questionNumber,
                questionText: newQuestion.questionText,
                status: newQuestion.status,
                created_at: newQuestion.created_at
            }
        });


    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    };
};


const update = async (req, res) => {
    try {
        const quizID = req.params.quizID;
        const questionID = req.params.questionID;
        const { questionNumber, questionText, status } = req.body;

        // Validate question ID
        if (!questionID) {
            return res.status(400).json({
                error: 'Question ID is required'
            });
        };

        // Check if quiz ID exists
        const existinQuestion = await Question.findById(questionID);
        if (!existinQuestion) {
            return res.status(404).json({
                error: 'Question not found'
            });
        };

        // Check if courseId exists
        const existingQuiz = await Quiz.findById(quizID);
        if (quizID !== undefined && !existingQuiz) {
            return res.status(404).json({
                error: 'Quiz not found'
            });
        };

        // Validate if question number is already used in the same quiz
        const currentQuestionNumber = questionNumber !== undefined ? questionNumber : existinQuestion.questionNumber;
        const existingQuestionNumber = await Question.findByQuizIdQuestionNumber(quizID, currentQuestionNumber);

        if (existingQuestionNumber && existingQuestionNumber.questionID !== parseInt(questionID)) {
            return res.status(400).json({
                error: 'Selected question number already used in the selected quiz'
            });
        };

        // Validate status
        questionStatus = status;
        if (questionStatus !== undefined && !VALID_QUESTION_STATUS.includes(questionStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUESTION_STATUS.join(', ')} `
            });
        };
        
        // Prepare update data
        const updateData = {};
        if (questionNumber !== undefined) updateData.questionNumber = questionNumber;
        if (questionText !== undefined) updateData.questionText = questionText;
        if (status !== undefined) updateData.status = questionStatus;

        // Update module
        const updateQuestion = await Question.update(questionID, updateData);

        res.json({
            message: 'Question updated successfully',
            question: {
                questionID: updateQuestion.questionID,
                quizID: updateQuestion.quizID,
                questionNumber: updateQuestion.questionNumber,
                questionText: updateQuestion.questionText,
                status: updateQuestion.status,
                udpated_at: updateQuestion.udpated_at
            }
        });

    } catch(error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getQuestion = async (req, res) => {
    try {
        const questionID = req.params.questionID;
        const question = await Question.findById(questionID);
        if (!question) {
            return res.status(400).json({
                error: 'Invalid question id. Question not found.'
            });
        }

        res.json(question);
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getAllInQuiz = async (req, res) => {
    const quizID = req.params.quizID;
    const question = await Question.findByQuizId(quizID);
    res.json(question);
};


const getMeta = (req, res) => {
    res.json({
        status: VALID_QUESTION_STATUS,
    })
};


module.exports = {
  register,
  update,
  getQuestion,
  getAllInQuiz,
  getMeta,
};