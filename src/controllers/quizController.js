const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const { VALID_QUIZ_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const moduleid = req.params.moduleid;
        const { title, timelimit, status } = req.body;

        // Validate course id is provided
        if (!moduleid) {
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
        const quizstatus = status || 'draft'

        if (!VALID_QUIZ_STATUS.includes(quizstatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUIZ_STATUS.join(', ')} `
            });
        }

        // Validate module ID
        const quizModule = await Module.findById(moduleid)
        if (!quizModule) {
            return res.status(400).json({
                error: 'Invalid module ID. Module does not exist.'
            });
        }

        // Create course
        const newQuiz = await Quiz.create({
            moduleid, 
            title, 
            timelimit, 
            status: quizstatus
        });

        res.json({
            message: 'Module registered successfully',
            module: {
                quizid: newQuiz.quizid,
                moduleid: newQuiz.moduleid,
                title: newQuiz.title,
                timelimit: newQuiz.timelimit,
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
        const moduleid = req.params.moduleid;
        const quizid = req.params.quizid;
        const { title, timelimit, status } = req.body;

        // Check if quiz ID exists
        const existinQuiz = await Quiz.findById(quizid);
        if (!existinQuiz) {
            return res.status(404).json({
                error: 'Quiz not found'
            });
        }

        // Validate quizid
        if (!quizid) {
            return res.status(400).json({
                error: 'Quiz ID is required'
            });
        }

        // Check if courseId exists
        const existingModule = await Module.findById(moduleid);
        if (moduleid !== undefined && !existingCourse) {
            return res.status(404).json({
                error: 'Module not found'
            });
        }

        // Validate status
        quizstatus = status;
        if (quizstatus !== undefined && !VALID_QUIZ_STATUS.includes(quizstatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUIZ_STATUS.join(', ')} `
            });
        }
        
        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (timelimit !== undefined) updateData.timelimit = timelimit;
        if (status !== undefined) updateData.status = quizstatus;

        // Update module
        const updateQuiz = await Quiz.update(quizid, updateData);

        res.json({
            message: 'Module updated successfully',
            module: {
                quizid: newQuiz.quizid,
                moduleid: newQuiz.moduleid,
                title: newQuiz.title,
                timelimit: newQuiz.timelimit,
                status: newQuiz.status,
                udpated_at: newQuiz.udpated_at
            }
        });

    } catch(error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getQuiz = async (req, res) => {
    try {
        const quizid = req.params.quizid;
        const quiz = await Quiz.findById(quizid);
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
    const moduleid = req.params.moduleid;
    const quiz = await Quiz.findByModule(moduleid);
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