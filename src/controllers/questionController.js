const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Module = require('../models/Module');
const { VALID_QUESTION_STATUS } = require('../config/constants');
const {
    registerOption,
    updateOption,
    inactivateOption
} = require('./optionController');
const AnswerOption = require('../models/AnswerOption');

const { pool } = require('../config/database');


const registerQuestion = async (quiz, question) => {
    const { questionNumber, questionText, status, options =[] } = question

    // Basic validataion
    if (!questionNumber || !questionText || !status || !options) {
        throw new Error('Question registration error: Question number, question text, status and options are required');
    }

    // Validate status
    const questionStatus = status || 'active';
    if (!VALID_QUESTION_STATUS.includes(questionStatus)) {
        throw new Error(`Question registration error: Invalid status. Must be:${VALID_QUESTION_STATUS.join(', ')}`);
    }

    // Validate if question number is already used in the same quiz
    const existingQuestionNumber = await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber);
    if (existingQuestionNumber) {
        throw new Error('Question registration error: Selected quiz number already used in the selected course');
    }

    // Create questions
    const newQuestion = await Question.create({
        quizID: quiz.quizID, 
        questionNumber, 
        questionText, 
        status: questionStatus
    });

    // Call option registration
    const newOptions = []
    for (const option of options) {
        const newOption = await registerOption(newQuestion, option);
        newOptions.push(newOption);
    };

    return { ...newQuestion, options: newOptions };
};


const updateQuestion = async (quiz, question, client) => {
    try {
        const { questionNumber, questionText, status, options =[] } = question

        // Validate question number
        if (!questionNumber) {
             throw new Error(`Question update error: Question number required`);
        };

        // In case of new question number, register the question
        const existingQuestion = await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber, client);
        if (!existingQuestion) {
            return registerQuestion(quiz, question);
        };
        
        // Validate status
        const questionStatus = status;
        if (questionStatus !== undefined && !VALID_QUESTION_STATUS.includes(questionStatus)) {
            throw new Error(`Question update error: Invalid status. Must be:${VALID_QUESTION_STATUS.join(', ')} `);
        };

        // Validate if there will be any multiple correct answers
        const currentAnswer = await AnswerOption.findAnswerForQuestion(existingQuestion.questionID, client);
        let answerCounter = 0;
        for (const option of options) {
            if (option.isCorrect && option.optionOrder !== currentAnswer?.optionOrder) {
                answerCounter++;
            }
        };

        if ((currentAnswer && answerCounter > 0) || answerCounter > 1) {
            throw new Error('Option update error: Multiple correct options selected.')
        };

        // Validate option's data type
        if (!Array.isArray(options)) {
            throw new Error('Options must be an array.');
        }
        
        // Try updating questions first
        const optionOrders = (await AnswerOption.findByQuestionID(existingQuestion.questionID, client)).map(o=> o.optionOrder);
        for (const order of optionOrders) {
            if (!options.map(o => o.optionOrder).includes(order)) {
                const deletedOption = await AnswerOption.findByQuestionIdOptionOrder(existingQuestion.questionID, order, client);
                await inactivateOption(deletedOption, client);
            }
        }

        // Update options
        const updatedOptions = []
        for (const option of options) {
            const updatedOption = await updateOption(existingQuestion, option, client);
            updatedOptions.push(updatedOption);
        };
        
        // Prepare update data
        const updateData = {};
        if (questionText !== undefined) updateData.questionText = questionText;
        if (status !== undefined) updateData.status = questionStatus;

        // Update module
        const updatedQuestion =  await Question.update(existingQuestion.questionID, updateData, client);

        return { 
            ...updatedQuestion, 
            options: updatedOptions 
        }
    } catch(error) {
        throw error;
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

const inactivateQuestion = async(question, client) => {
    await Question.update(question.questionID, {status: 'inactive'}, client);
}

const getMeta = (req, res) => {
    res.json({
        status: VALID_QUESTION_STATUS,
    })
};


module.exports = {
  registerQuestion,
  updateQuestion,
  inactivateQuestion,
  getQuestion,
  getAllInQuiz,
  getMeta,
};