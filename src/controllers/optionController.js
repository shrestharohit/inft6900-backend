const Question = require('../models/Question');
const AnswerOption = require('../models/AnswerOption');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const { VALID_OPTION_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const questionNumber = req.params.questionNumber;
        const moduleNumber = req.params.moduleNumber;
        const courseID = req.params.courseID;

        const { optionText, isCorrect, optionOrder, feedbackText, status } = req.body;

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

        // Basic validataion
        if (!optionText || isCorrect===undefined || !optionOrder || !feedbackText || !status) {
            return res.status(400).json({
                error: 'Option text, isCorrect, option order, feedback text and status are required'
            });
        }

        // Validate if question number is already used in the same quiz
        const existingoptionOrder = await AnswerOption.findByQuestionIdOptionOrder(question.questionID, optionOrder);
        if (existingoptionOrder) {
            return res.status(400).json({
                error: 'Selected option order already used in the selected question'
            });
        };

        // Validate if there are no multiple correct answers in question
        const existingCorrectOption = await AnswerOption.findAnswerForQuestion(question.questionID);
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
            questionID: question.questionID, 
            optionText,
            isCorrect, 
            optionOrder, 
            feedbackText, 
            status: optionStatus
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
        const currentOptionOrder = req.params.optionOrder;
        const questionNumber = req.params.questionNumber;
        const moduleNumber = req.params.moduleNumber;
        const courseID = req.params.courseID;
        
        const { optionOrder, optionText, isCorrect, feedbackText, status } = req.body;

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

        // Validate if option exists in the quiz
        const existingOption = await AnswerOption.findByQuestionIdOptionOrder(question.questionID, currentOptionOrder);
        if (!existingOption) {
            return res.status(400).json({
                error: 'Invalid option order. Answer option not found.'
            });
        };

        // Validate if question number is already used in the same quiz
        const isUsedOptionOrder = !!(await AnswerOption.findByQuestionIdOptionOrder(question.questionID, currentOptionOrder));
        if (optionOrder && optionOrder !== parseInt(currentOptionOrder) && isUsedOptionOrder) {
            return res.status(400).json({
                error: 'Selected option order already used in the selected question'
            });
        };

        // Validate if there are no multiple correct answers in question
        const existingCorrectOption = await AnswerOption.findAnswerForQuestion(question.questionID);
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
        if (optionText !== undefined) updateData.optiontext = optionText;
        if (isCorrect !== undefined) updateData.isCorrect = isCorrect;
        if (optionOrder !== undefined) updateData.optionOrder = optionOrder;
        if (feedbackText !== undefined) updateData.feedbackText = feedbackText;
        if (status !== undefined) updateData.status = optionStatus;

        // Update module
        const updateOption = await AnswerOption.update(existingOption.optionID, updateData);

        res.json({
            message: 'Answer option updated successfully',
            option: {
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
        console.error('Update option error:', error);
        res.status(500).json({ error: 'Internal server error' });
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