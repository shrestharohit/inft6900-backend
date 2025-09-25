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
        const question = await Question.findById(questionID, client);
        if (!question) {
            throw new Error('Invalid quesiton ID. Question not found.');
        };
        
        // Validate option ID
        const option = await AnswerOption.findById(optionID, client);
        if (optionID !== null && !option) {
            throw new Error('Invalid option ID. Option not found.');
        };
        
        // Register answer
        const attemptAnswer = await AttemptAnswer.create({
            attemptID: attempt.attemptID, 
            questionID: questionID, 
            optionID: optionID
        }, client);

        return { attemptAnswer };
    } catch(error) {
        throw error;
    }
};

module.exports = {
  registerAnswer
};