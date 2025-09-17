const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const { VALID_QUIZ_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const moduleID = req.params.moduleID;
        const { title, timeLimit, status } = req.body;

        // Validate course id is provided
        if (!moduleID) {
            return res.status(400).json({ 
                error: 'Module ID is required in header (moduleID) or query parameter (moduleID)' 
            });
        }

        // Basic validataion
        if (!title || !status) {
            return res.status(400).json({
                error: 'Title and status are required'
            });
        }

        // Validate status
        const quizStatus = status || 'draft'

        if (!VALID_QUIZ_STATUS.includes(quizStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUIZ_STATUS.join(', ')} `
            });
        }

        // Validate module ID
        const quizModule = await Module.findById(moduleID)
        if (!quizModule) {
            return res.status(400).json({
                error: 'Invalid module ID. Module does not exist.'
            });
        }

        // Create course
        const newQuiz = await Quiz.create({
            moduleID, 
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
        const moduleID = req.params.moduleID;
        const quizID = req.params.quizID;
        const { title, timeLimit, status } = req.body;

        // Check if quiz ID exists
        const existinQuiz = await Quiz.findById(quizID);
        if (!existinQuiz) {
            return res.status(404).json({
                error: 'Quiz not found'
            });
        };

        // Validate quizid
        if (!quizID) {
            return res.status(400).json({
                error: 'Quiz ID is required'
            });
        }

        // Check if moduleID exists
        const existingModule = await Module.findById(moduleID);
        if (moduleID !== undefined && !existingModule) {
            return res.status(404).json({
                error: 'Module not found'
            });
        }

        // Validate status
        const quizStatus = status;
        if (quizStatus !== undefined && !VALID_QUIZ_STATUS.includes(quizStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUIZ_STATUS.join(', ')} `
            });
        }
        
        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
        if (status !== undefined) updateData.status = quizStatus;

        // Update module
        const updateQuiz = await Quiz.update(quizID, updateData);

        res.json({
            message: 'Quiz updated successfully',
            quiz: {
                quizid: updateQuiz.quizid,
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
        const quizID = req.params.quizID;
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(400).json({
                error: 'Invalid quiz id. Quiz not found.'
            });
        }

        res.json(quiz);
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getAllInModule = async (req, res) => {
    const moduleID = req.params.moduleID;
    const quiz = await Quiz.findByModule(moduleID);
    res.json(quiz);
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
  getAllInModule,
  getMeta,
};