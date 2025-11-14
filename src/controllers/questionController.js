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
    const { questionNumber, questionText, status, options } = question

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
    const processedOptions = options.map((opt, i) => ({
        ...opt,
        optionOrder: i+1
    }))
    for (const option of processedOptions) {
        const newOption = await registerOption(newQuestion, option);
        newOptions.push(newOption);
    };

    return { ...newQuestion, options: newOptions };
};


const updateQuestion = async (quiz, question, client) => {
    try {
        const { questionID, questionNumber, questionText, status, options =[] } = question

        // Basic valiadtion
        if (!questionID) {
             throw new Error(`Question update error: Question ID required`);
        };

        // Validate if question ID exists
        const existingQuestion = await Question.findById(questionID);
        if (!existingQuestion) {
            throw new Error('Question update error: Selected question does not exist.')
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

        if (answerCounter > 1) {
            throw new Error('Option update error: Multiple correct options selected.')
        };

        // Validate if the question number is already takne
        if (questionNumber !== undefined && questionNumber !== existingQuestion.questionNumber) {
            const existingQuestionNumber = await Question.findByQuizIdQuestionNumber(quiz.quizID, questionNumber, client);
            console.log(existingQuestionNumber)
            if (existingQuestionNumber !== undefined) {
                throw new Error('Question update error: Selected question number already used');
            }
        }

        // Validate option's data type
        if (!Array.isArray(options)) {
            throw new Error('Options must be an array.');
        }
        
        // Try updating questions first
        const optionIDs = (await AnswerOption.findByQuestionID(existingQuestion.questionID)).map(o=> o.optionID);
        for (const id of optionIDs) {
            if (!options.map(o => o.optionID).includes(id)) {
                const deletedOption = await AnswerOption.findById(id);
                await inactivateOption(deletedOption, client);
            }
        }

        // Update options
        const updatedOptions = []
        for (const option of options) {
            // if option ID is specified, update the specified option. otherwise, take it as a new option.
            if (option.optionID) {
                const updatedOption = await updateOption(existingQuestion, option, client);
                updatedOptions.push(updatedOption);
            } else {
                const newOption = await registerOption(existingQuestion, option, client);
                updatedOptions.push(newOption);
            }
        };
        
        // Prepare update data
        const updateData = {};
        if (questionNumber !== undefined) updateData.questionNumber = questionNumber;
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
        const questionID = req.params.questionID;

        // Check if question exists
        const question = await Question.findById(questionID);
        if (!question) {
            return res.status(404).json({
                error: 'Question not found'
            });
        };

        res.json(question);
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getAnswerInQuestion = async (req, res) => {
    try{
        const questionID = req.params.questionID;

        // Check if quiz exists
        const question = await Question.findById(questionID);
        if (!question) {
            return res.status(404).json({
                error: 'Question not found.'
            });
        }

        const answer = await Question.findAnswer(questionID);
        res.json(answer);
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllInQuiz = async (req, res) => {
    try{
        const quizID = req.params.quizID;

        // Check if quiz exists
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        }

        const questions = await Question.findByQuizId(quiz.quizID);
        res.json(questions);
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const inactivateQuestion = async(question, client) => {
    return await Question.update(question.questionID, {status: 'inactive'}, client);
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
  getAnswerInQuestion,
  getAllInQuiz,
  getMeta,
};