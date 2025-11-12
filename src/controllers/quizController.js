const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const AnswerOption = require('../models/AnswerOption');
const User = require('../models/User');
const Course = require('../models/Course');
const { VALID_QUIZ_STATUS } = require('../config/constants');
const {
    registerQuestion,
    updateQuestion,
    inactivateQuestion,
} = require('./questionController')

const { pool } = require('../config/database');


// To shorten the API route, use module ID to get the quiz.
// Each module can only have 1 quiz, so this works.

const register = async (req, res) => {
    try {
        const { moduleID, title, timeLimit, status, questions } = req.body;

        // Basic validataion
        if (!moduleID || !title || !questions ) {
            return res.status(400).json({
                error: 'Module ID, title, status and questions are required'
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
        const quizModule = await Module.findById(moduleID);
        if (!quizModule) {
            return res.status(400).json({
                error: 'Invalid module ID. Module not found.'
            });
        };

        // Check if there is already a quiz created for the module
        const exists = !!(await Quiz.findByModuleID(quizModule.moduleID));
        if (exists) {
            return res.status(400).json({
                error: 'Quiz already exists. Each module can only have 1 quiz.'
            });
        }

        // Create Quiz
        const newQuiz = await Quiz.create({
            moduleID: moduleID, 
            title,
            timeLimit, 
            status: quizStatus
        });

        // try creating questions
        const newQuestions = []
        for (const question of questions) {
            try {
                const newQuestion = await registerQuestion(newQuiz, question);
                newQuestions.push(newQuestion);
            } catch (error) {
                // delete created quiz
                Quiz.delete(newQuiz.quizID);

                console.error('Question registration error:', error.message);
                return res.status(400).json({
                    error: error.message
                });
            }
        };

        res.json({
            message: 'Quiz registered successfully',
            quiz: {
                quizID: newQuiz.quizID,
                moduleID: newQuiz.moduleID,
                title: newQuiz.title,
                timeLimit: newQuiz.timeLimit,
                status: newQuiz.status,
                questions: newQuestions,
                created_at: newQuiz.created_at
            }
        })


    } catch(error) {
        res.status(500).json({ error: `Registration error:${error.message}`  });
    }
};


const update = async (req, res) => {
    const client = await pool.connect();
    await client.query('BEGIN')

    try {
        const { quizID } = req.params;
        const { moduleID, title, timeLimit, status, questions } = req.body;

        
        // Check if quiz exists
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        };

        // Check if quiz under the selected module exists
        if (moduleID !== quiz.moduleID) {
            const existingQuiz = await Quiz.findByModuleID(moduleID, client);
            if (existingQuiz) {
                return res.status(400).json({
                    error: 'Quiz already exists. Each module can only have 1 quiz.'
                });
            }
        }

        // Validate status
        const quizStatus = status;
        if (quizStatus !== undefined && !VALID_QUIZ_STATUS.includes(quizStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_QUIZ_STATUS.join(', ')} `
            });
        };

        // Validate question's data type
        if (!Array.isArray(questions)) {
            return res.status(400).json({ error: 'Questions must be an array.' });
        };

        // any missing question will be treated as deleted (inactive)
        const questionNumbers = (await Question.findByQuizId(quiz.quizID, client)).map(q => q.questionNumber);
        for (const number of questionNumbers) {
            if (!questions.map(q => q.questionNumber).includes(number)) {
                const deletedQuestion = await Question.findByQuizIdQuestionNumber(quiz.quizID, number, client);
                await inactivateQuestion(deletedQuestion, client);
            };
        };

        // Try updating questions
        const updatedQuestions = [];
        try {
            for (const question of questions) {
                if (question.questionID) {
                    const updatedQuestion = await updateQuestion(quiz, question, client);
                    updatedQuestions.push(updatedQuestion);
                } else {
                    const newQuestion = await registerQuestion(quiz, question, client);
                    updatedQuestions.push(newQuestion);
                }
            }
        } catch(error) {
            console.error('Question update error:', error.message);
            return res.status(400).json({
                error: error.message
            });
        };

        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
        if (status !== undefined) updateData.status = quizStatus;

        // Update module
        const updateQuiz = await Quiz.update(quizID, updateData, client);
        await client.query('COMMIT');

        res.json({
            message: 'Quiz updated successfully',
            quiz: {
                quizID: updateQuiz.quizID,
                moduleID: updateQuiz.moduleID,
                title: updateQuiz.title,
                timeLimit: updateQuiz.timeLimit,
                status: updateQuiz.status,
                questions: updatedQuestions,
                updated_at: updateQuiz.updated_at
            }
        });

    } catch(error) {
        await client.query('ROLLBACK');
        console.error('Update quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

const getQuiz = async (req, res) => {
    try {
        const quizID = req.params.quizID;

        // Check if quiz is already created for the module
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        }

        // Get all questions and options
        const questions = await Question.findByQuizId(quiz.quizID);
        for (const question of questions) {
            const options = await AnswerOption.findByQuestionID(question.questionID);
            question.options = options;
        }
        quiz.questions = questions;

        res.json(quiz);
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getAllFromCourse = async(req, res) => {
    try {
        const courseID = req.params.courseID;
        const userID = req.headers['x-user-id'];

        // Validate course ID
        if (!courseID) {
            return res.status(400).json({
                error: 'Course ID required.'
            });
        }

        // Validate user ID
        if (!userID) {
            return res.status(403).json({
                error: 'Forbidden access'
            })
        };

        const user = await User.findById(userID);

        // Check if user exists
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(404).json({
                error: 'Course not found.'
            });
        }

        let quizzes = await Quiz.findByCourseID(courseID);
        if (user.role === 'student') {
            quizzes = quizzes.filter(q => q.status === 'active');
        }
        
        // Get all questions and options
        for (const quiz of quizzes) {
            const questions = await Question.findByQuizId(quiz.quizID);
            for (const question of questions) {
                let options = await AnswerOption.findByQuestionID(question.questionID);
                question.options = options;

                // do not include answers and feedback if the user is student
                if (user.role === 'student') {
                    options = options.forEach(o => {
                        delete o.isCorrect,
                        delete o.feedbackText
                    })
                }
            }
            quiz.questions = questions;
        }

        res.json(quizzes);
    } catch(error) {
        console.error('Get course quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const getAllFromCourseOwner = async(req, res) => {
    try {
        const userID = req.params.userID;

        // Validate user ID
        if (!userID) {
            return res.status(400).json({
                error: 'User ID required.'
            });
        }

        // Check if user exists
        const user = await User.findById(userID);
        if (!user || user.role !== 'course_owner') {
            return res.status(404).json({
                error: 'Course owner not found.'
            });
        }

        const quizzes = await Quiz.findByCourseOwner(userID);
        
        // Get all questions and options
        for (const quiz of quizzes) {
            const questions = await Question.findByQuizId(quiz.quizID);
            for (const question of questions) {
                const options = await AnswerOption.findByQuestionID(question.questionID);
                question.options = options;
            }
            quiz.questions = questions;
        }

        res.json(quizzes);
    } catch(error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getWaitForApproval = async (req, res) => {
    try {
        const quizzes = await Quiz.getApprovalList();
        for (const quiz of quizzes) {
            const questions = await Question.findByQuizId(quiz.quizID);
            for (const question of questions) {
                const options = await AnswerOption.findByQuestionID(question.questionID);
                question.options = options;
            }
            quiz.questions = questions;
        }

        res.json(quizzes);
    } catch(error) {
        console.error('Get quiz approval list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getDetail = async (req, res) => {
    try {
        const quizID = req.params.quizID;

        // Check if quiz is already created for the module
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        }

        // Get all questions and options
        const questions = await Question.findByQuizId(quizID);
        const questionList = []
        for (const question of questions) {
            const options = await AnswerOption.findByQuestionID(question.questionID);
            question['options'] = options;
            questionList.push(question);
        }

        quiz['questions'] = questionList;

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

// Sync status with course status
const syncQuizStatus = async (courseID) => {
    try {
        const course = await Course.findById(courseID);
        if (!course) {
            throw new Error('Invalid course ID. Course not found.');
        }

        const quizzes = await Quiz.findByCourseID(courseID);
        if (quizzes.length > 0) {
            for (quiz of quizzes) {
                // if module status is inactive (deleted), do not change the status
                if (quiz.status === 'inactive') {
                    break;
                }

                // otherwise, sync the status with course
                const updated = await Quiz.update(quiz.quizID, {
                    status: course.status
                })
            }
        }
    } catch (error) {
        throw new Error('Quiz status sync error: ' + error);
    }
}

module.exports = {
  register,
  update,
  getQuiz,
  getAllFromCourseOwner,
  getAllFromCourse,
  getWaitForApproval,
  getDetail,
  getMeta,
  syncQuizStatus,
};