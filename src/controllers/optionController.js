const Question = require('../models/Question');
const AnswerOption = require('../models/AnswerOption');
const { VALID_OPTION_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const questionID = req.params.questionID;
        const { optionText, isCorrect, optionOrder, feedbackText, status } = req.body;

        // Validate question id is provided
        if (!questionID) {
            return res.status(400).json({ 
                error: 'Question ID is required in header (questionID) or query parameter (questionID)'
            });
        }

        // Validate module ID
        const optionQuestion = await Question.findById(questionID);
        if (!optionQuestion) {
            return res.status(400).json({
                error: 'Invalid question ID. Question does not exist.'
            });
        }

        // Basic validataion
        if (!optionText || isCorrect===undefined || !optionOrder || !feedbackText || !status) {
            return res.status(400).json({
                error: 'Option text, isCorrect, option order, feedback text and status are required'
            });
        }

        // Validate if question number is already used in the same quiz
        const existingoptionOrder = await AnswerOption.findByQuestionIdOptionOrder(questionID, optionOrder);
        if (existingoptionOrder) {
            return res.status(400).json({
                error: 'Selected option order already used in the selected question'
            });
        };

        // Validate if there are no multiple correct answers in question
        const existingCorrectOption = await AnswerOption.findAnswerForQuestion(questionID);
        if (existingCorrectOption && isCorrect == true) {
            return res.status(400).json({
                error: 'Selected question already has correct answer'
            });
        };

        // Validate status
        const optionStatus = status || 'active';

        if (!VALID_OPTION_STATUS.includes(optionStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_OPTION_STATUS.join(', ')} `
            });
        }

        // Create course
        const newOption = await AnswerOption.create({
            questionID, 
            optionText,
            isCorrect, 
            optionOrder, 
            feedbackText, 
            status
        });

        res.json({
            message: 'Answer option registered successfully',
            option: {
                optionID: newOption.optionID,
                optiontext: newOption.optiontext,
                isCorrect: newOption.isCorrect,
                optionOrder: newOption.optionOrder,
                feedbackText: newOption.feedbackText,
                status: newOption.status,
                created_at: newOption.created_at
            }
        });


    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    };
};


const update = async (req, res) => {
    try {
        const questionID = req.params.questionID;
        const optionID = req.params.optionID;
        const { qoptionText, isCorrect, optionOrder, feedbackText, status } = req.body;

        // Validate option ID
        if (!optionID) {
            return res.status(400).json({
                error: 'Option ID is required'
            });
        };

        // Check if option ID exists
        const existingOption = await AnswerOption.findById(optionID);
        if (!existingOption) {
            return res.status(404).json({
                error: 'Answer option not found'
            });
        };

        // Check if question exists
        const existingQuestion = await Question.findById(questionID);
        if (questionID !== undefined && !existingQuestion) {
            return res.status(404).json({
                error: 'Question not found'
            });
        };

        // Validate if question number is already used in the same quiz
        const currentoptionOrder = optionOrder !== undefined ? optionOrder : existingOption.optionOrder;
        const existingoptionOrder = await AnswerOption.findByQuestionIdOptionOrder(questionID, currentoptionOrder);

        if (existingoptionOrder && existingoptionOrder.optionID !== parseInt(optionID)) {
            return res.status(400).json({
                error: 'Selected option order already used in the selected question'
            });
        };

        // Validate if there are no multiple correct answers in question
        const existingCorrectOption = await AnswerOption.findAnswerForQuestion(questionID);
        if (existingCorrectOption && existingOption.isCorrect == false && isCorrect == true) {
            return res.status(400).json({
                error: 'Selected question already has correct answer'
            });
        };

        // Validate status
        optionStatus = status;
        if (optionStatus !== undefined && !VALID_OPTION_STATUS.includes(optionStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_OPTION_STATUS.join(', ')} `
            });
        };
        
        // Prepare update data
        const updateData = {};
        if (qoptionText !== undefined) updateData.optiontext = qoptionText;
        if (isCorrect !== undefined) updateData.isCorrect = isCorrect;
        if (optionOrder !== undefined) updateData.optionOrder = optionOrder;
        if (feedbackText !== undefined) updateData.feedbackText = feedbackText;
        if (status !== undefined) updateData.status = optionStatus;

        // Update module
        const updateOption = await AnswerOption.update(optionID, updateData);

        res.json({
            message: 'Answer option updated successfully',
            module: {
                optionID: updateOption.optionID,
                optiontext: updateOption.optiontext,
                isCorrect: updateOption.isCorrect,
                optionOrder: updateOption.optionOrder,
                feedbackText: updateOption.feedbackText,
                status: updateOption.status,
                udpated_at: updateOption.udpated_at
            }
        });

    } catch(error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getOption = async (req, res) => {
    try {
        const optionID = req.params.optionID;
        const option = await Question.findById(optionID);

        if (!option) {
            return res.status(400).json({
                error: 'Invalid option id. Option not found.'
            });
        }

        res.json(option);
    } catch (error) {
        console.error('Get option error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getAllInQuestion = async (req, res) => {
    const questionID = req.params.questionID;
    const options = await AnswerOption.findByquestionID(questionID);
    res.json(options);
};


const getAnswerInQuestion = async (req, res) => {
    const questionID = req.params.questionID;
    const options = await AnswerOption.findAnswerForQuestion(questionID);
    res.json(options);
};

const getMeta = (req, res) => {
    res.json({
        status: VALID_OPTION_STATUS,
    })
};


module.exports = {
  register,
  update,
  getOption,
  getAllInQuestion,
  getAnswerInQuestion,
  getMeta,
};