const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const { VALID_QUIZ_STATUS } = require('../config/constants');

// To shorten the API route, use module ID to get the quiz.
// Each module can only have 1 quiz, so this works.

const register = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const moduleNumber = req.params.moduleNumber;
        const { title, timeLimit, status } = req.body;

        // Validate course id is provided
        if (!moduleNumber) {
            return res.status(400).json({ 
                error: 'Module number is required.' 
            });
        };

        // Basic validataion
        if (!title || !status) {
            return res.status(400).json({
                error: 'Title and status are required'
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
        const quizModule = await Module.findByCourseIdModuleNumber(courseID, moduleNumber);
        if (!quizModule) {
            return res.status(400).json({
                error: 'Invalid course ID and module number. Module not found.'
            });
        };

        // Check if there is already a quiz created for the module
        const exists = !!(await Quiz.findByModule(quizModule.moduleID));
        if (exists) {
            return res.status(400).json({
                error: 'Quiz already exists. Each module can only have 1 quiz.'
            });
        }

        // Create course
        const newQuiz = await Quiz.create({
            moduleID: quizModule.moduleID, 
            title,
            timeLimit, 
            status: quizStatus
        });

        res.json({
            message: 'Quiz registered successfully',
            quiz: {
                quizID: newQuiz.quizID,
                moduleID: newQuiz.moduleID,
                title: newQuiz.title,
                timeLimit: newQuiz.timeLimit,
                status: newQuiz.status,
                created_at: newQuiz.created_at
            }
        })


    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const update = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const moduleNumber = req.params.moduleNumber;
        const { title, timeLimit, status } = req.body;

        // Validate course number is provided
        if (!moduleNumber) {
            return res.status(400).json({ 
                error: 'Module number is required.' 
            });
        };

        // Validate module number and course ID
        const existingModule = await Module.findByCourseIdModuleNumber(courseID, moduleNumber);
        if (moduleNumber !== undefined && !existingModule) {
            return res.status(404).json({
                error: 'Invalid course ID and module number. Module not found.'
            });
        }

        // Check if quiz under the selected module exists
        const existingQuiz = await Quiz.findByModule(existingModule.moduleID);
        if (!existingQuiz) {
            return res.status(404).json({
                error: 'Quiz not found'
            });
        };

        // Validate status
        const quizStatus = status;
        if (quizStatus !== undefined && !VALID_QUIZ_STATUS.includes(quizStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUIZ_STATUS.join(', ')} `
            });
        }

        // Prepare update data
        const updateData = {};
        const quizID = existingQuiz.quizID;
        if (title !== undefined) updateData.title = title;
        if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
        if (status !== undefined) updateData.status = quizStatus;

        // Update module
        const updateQuiz = await Quiz.update(quizID, updateData);

        res.json({
            message: 'Quiz updated successfully',
            quiz: {
                quizID: updateQuiz.quizID,
                moduleID: updateQuiz.moduleID,
                title: updateQuiz.title,
                timeLimit: updateQuiz.timeLimit,
                status: updateQuiz.status,
                udpated_at: updateQuiz.udpated_at
            }
        });

    } catch(error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getQuiz = async (req, res) => {
    try {
        // To shorten the API route, use module ID to get the quiz.
        // Each module can only have 1 quiz, so this works.
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
  getMeta,
};