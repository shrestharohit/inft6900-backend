const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Module = require('../models/Module');
const { VALID_QUESTION_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const moduleNumber = req.params.moduleNumber;
        const courseID = req.params.courseID;
        const { questionNumber, questionText, status } = req.body;

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
        
        // Basic validataion
        if (!questionNumber || !questionText || !status) {
            return res.status(400).json({
                error: 'Question number, question text and status are required'
            });
        }

        // Validate if question number is already used in the same quiz
        const existingQuestionNumber = await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber);
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
            quizID: quiz.quizID, 
            questionNumber, 
            questionText, 
            status: questionStatus
        });

        res.json({
            message: 'Question registered successfully',
            question: {
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
        const currentQuestionNumber = req.params.questionNumber;
        const moduleNumber = req.params.moduleNumber;
        const courseID = req.params.courseID;
        const { questionNumber, questionText, status } = req.body;

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
        
        // Validate question number
        if (!currentQuestionNumber) {
            return res.status(400).json({
                error: 'Question number is required'
            });
        };

        // Check if question exists
        const existingQuestion = await Question.findByQuizIdQuestionNumber(quiz.quizID, currentQuestionNumber);
        if (!existingQuestion) {
            return res.status(404).json({
                error: 'Question not found'
            });
        };

        // Validate if question number is already used in the same quiz
        const isUsedQuestionNumber = !!(await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber));
        if (questionNumber && questionNumber !== parseInt(currentQuestionNumber) && isUsedQuestionNumber) {
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
        const updateQuestion = await Question.update(existingQuestion.questionID, updateData);

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
        const questionNumber = req.params.questionNumber;
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

        // Check if question exists
        const existingQuestion = await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber);
        if (!existingQuestion) {
            return res.status(404).json({
                error: 'Question not found'
            });
        };

        res.json(existingQuestion);
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getAllInQuiz = async (req, res) => {
    try{
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

        const question = await Question.findByQuizId(quiz.quizID);
        res.json(question);
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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