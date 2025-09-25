const Question = require('../models/Question');
const AnswerOption = require('../models/AnswerOption');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const { VALID_OPTION_STATUS } = require('../config/constants');

const { pool } = require('../config/database');



const registerOption = async (question, option, client) => {
    const { optionText, isCorrect, optionOrder, feedbackText, status } = option;

    // Basic validataion
    if (!optionText || isCorrect===undefined || !optionOrder || !feedbackText) {
        throw new Error('Option registration error: Option text, isCorrect, option order, feedback text and status are required')
    };

    // Validate if question number is already used in the same quiz
    const existingoptionOrder = await AnswerOption.findByQuestionIdOptionOrder(question.questionID, optionOrder);
    if (existingoptionOrder) {
        throw new Error('Option registration error: Selected option order already used in the selected question');
    };

    // Validate if there are no multiple correct answers in question
    const existingCorrectOption = await AnswerOption.findAnswerForQuestion(question.questionID);
    if (existingCorrectOption && isCorrect == true) {
        throw new Error('Option registration error: Selected question already has correct answer');
    };

    // Validate status
    const optionStatus = status || 'active';

    if (!VALID_OPTION_STATUS.includes(optionStatus)) {
        throw new Error(`Option registration error: Invalid status. Must be:${VALID_OPTION_STATUS.join(', ')} `);
    }

    // Create course
    return await AnswerOption.create({
        questionID: question.questionID, 
        optionText,
        isCorrect, 
        optionOrder, 
        feedbackText, 
        status: optionStatus
    });
};


const updateOption = async (question, option, client) => {
    try {
        const { optionID, optionText, isCorrect, optionOrder, feedbackText, status } = option;

        // Validate if option exists in the quiz
        const existingOption = await AnswerOption.findById(optionID);
        if (!existingOption) {
            throw new Error('Option update error: Selected option does not exist.')
        };

        // Validate if there are no multiple correct answers in question
        const existingCorrectOption = await AnswerOption.findAnswerForQuestion(question.questionID);
        if (existingCorrectOption && existingOption.isCorrect == false && isCorrect == true) {
            throw new Error('Option update error: Selected question already has correct answer');
        };

        // Validate if the option order is already takne
        if (optionOrder !== existingOption.optionOrder) {
            const existingOptionOrder = await AnswerOption.findByQuestionIdOptionOrder(question.questionID, optionOrder);
            if (existingOptionOrder) {
                throw new Error('Option update error: Selected option order already used');
            }
        }

        // Validate status
        const optionStatus = status;
        if (optionStatus !== undefined && !VALID_OPTION_STATUS.includes(optionStatus)) {
            throw new Error(`Option update error: Invalid status. Must be:${VALID_OPTION_STATUS.join(', ')} `);
        };
        
        // Prepare update data
        const updateData = {};
        if (optionText !== undefined) updateData.optionText = optionText;
        if (isCorrect !== undefined) updateData.isCorrect = isCorrect;
        if (optionOrder !== undefined) updateData.optionOrder = optionOrder;
        if (feedbackText !== undefined) updateData.feedbackText = feedbackText;
        if (status !== undefined) updateData.status = optionStatus;

        // Update module
        return await AnswerOption.update(existingOption.optionID, updateData, client);
    } catch(error) {
        throw error;
    }
};

const getOption = async (req, res) => {
    try {
        const optionOrder = req.params.optionOrder;
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
                error: 'Invalid quiz number. Quiz not found.'
            });
        }

        // Check if question is already created for the module
        const question = await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber);
        if (!question) {
            return res.status(400).json({
                error: 'Invalid question number. Question not found.'
            });
        }

        const option = await AnswerOption.findByQuestionIdOptionOrder(question.questionID, optionOrder);

        if (!option) {
            return res.status(400).json({
                error: 'Invalid option order. Option not found.'
            });
        }

        res.json(option);
    } catch (error) {
        console.error('Get option error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getAllInQuestion = async (req, res) => {
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
                error: 'Invalid quiz number. Quiz not found.'
            });
        }

        // Check if question is already created for the module
        const question = await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber);
        if (!question) {
            return res.status(400).json({
                error: 'Invalid question number. Question not found.'
            });
        }

        const options = await AnswerOption.findByQuestionID(question.questionID);
        res.json(options);

    } catch(error) {
        console.error('Get all options error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getAnswerInQuestion = async (req, res) => {
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
                error: 'Invalid quiz number. Quiz not found.'
            });
        }

        // Check if question is already created for the module
        const question = await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber);
        if (!question) {
            return res.status(400).json({
                error: 'Invalid question number. Question not found.'
            });
        }
        
        const option = await AnswerOption.findAnswerForQuestion(question.questionID);
        res.json(option);
    } catch(error) {
        console.error('Get answer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const inactivateOption = async(option, client) => {
    await AnswerOption.update(option.optionID, {status: 'inactive'}, client);
}


const getMeta = (req, res) => {
    res.json({
        status: VALID_OPTION_STATUS,
    })
};


module.exports = {
  registerOption,
  updateOption,
  getOption,
  getAllInQuestion,
  getAnswerInQuestion,
  inactivateOption,
  getMeta,
};