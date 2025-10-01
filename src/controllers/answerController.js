const User = require('../models/User');
const Enrolment = require('../models/Enrolment');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const AnswerOption = require('../models/AnswerOption');
const AttemptAnswer = require('../models/AttemptAnswer');

const registerAnswer = async (attempt, answer, client) => {
    try {
        const { questionID, optionID } = answer;

        // Basic validataion
        if (!questionID) {
            throw new Error('Attempt answer registration error: Question ID is required');
        };

        // Validate question ID
        const question = await Question.findById(questionID);
        if (!question) {
            throw new Error('Invalid quesiton ID. Question not found.');
        };
        
        // Validate option ID
        const option = await AnswerOption.findById(optionID);
        if (optionID !== null && !option) {
            throw new Error('Invalid option ID. Option not found.');
        };
        
        // Register answer
        const attemptAnswer = await AttemptAnswer.create({
            attemptID: attempt.attemptID, 
            questionID: questionID, 
            optionID: optionID
        }, client);

        // Prepare answer data
        const processedAnswer = attemptAnswer;
        const correctOption = await AnswerOption.findAnswerForQuestion(questionID)
        processedAnswer.correctOptionID = correctOption.optionID;

        if (!attemptAnswer.optionID) {
            answer = await AnswerOption.findById(processedAnswer.correctOptionID)
            processedAnswer.feedbackText = answer.feedbackText;
        }

        return processedAnswer;
    } catch(error) {
        throw error;
    }
};

module.exports = {
  registerAnswer
};