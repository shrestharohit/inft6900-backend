const User = require('../models/User');
const Enrolment = require('../models/Enrolment');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const AnswerOption = require('../models/AnswerOption');
const AttemptAnswer = require('../models/AttemptAnswer');
const {
    registerAnswer,
    // updateQuestion,
    // inactivateQuestion,
} = require('./answerController')

const { pool } = require('../config/database');
const QuizAttempt = require('../models/QuizAttempt');


// To shorten the API route, use module ID to get the quiz.
// Each module can only have 1 quiz, so this works.

const startAttempt = async(req, res) => {
    try {
        const { quizID } = req.params;
        const { enrolmentID } = req.body;

        // Validate course id is provided
        if (!quizID) {
            return res.status(400).json({ 
                error: 'Quiz ID required.' 
            });
        };

        // Basic validataion
        if (!enrolmentID) {
            return res.status(400).json({
                error: 'Enrolment ID required'
            });
        };

        // Check if there is any quiz for the module
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            return res.status(400).json({
                error: 'Invalid course ID and module number. Quiz not found.'
            });
        };

        // Validate enrolment
        const enrolment = await Enrolment.findById(enrolmentID);
        const enrolledCourse = enrolment.courseID;
        const module = await Quiz.findById(quizID)
        const quizCourse = await Module.findById(module.moduleID);

        if (!enrolment || enrolledCourse !== quizCourse.courseID) {
            return res.status(400).json({
                error: 'Enrolment has not been made for the course'
            });
        }

        // Create attempt
        const newAttempt = await QuizAttempt.start({
            quizID: quiz.quizID, 
            enrolmentID: enrolment.enrolmentID
        });

        res.json({
            message: 'Attempt started successfully',
            attempt: {
                attemptID: newAttempt.attemptID,
                quizID: newAttempt.quizID,
                enrolmentID: newAttempt.enrolmentID,
                count: newAttempt.count,
                startTime: newAttempt.startTime
            }
        });

    } catch(error) {
        res.status(500).json({ error: `Attempt start error: ${error.message}`  });
    }
}

const submitAttemp = async (req, res) => {
    const client = await pool.connect();
    await client.query('BEGIN');

    try {
        const { attemptID, answers } = req.body;

        // Check if attemptID is provided
        if (!attemptID) {
            return res.status(400).json({
                error: 'Attempt ID is required.'
            });
        }

        // Validate attempt ID Quiz
        const attempt = await QuizAttempt.findById(attemptID, client);
        if(!attempt) {
            return res.status(400).json({
                error: 'Invalid attemp ID. Quiz Attempt not found.'
            });
        };

        // Return error if user has already submitted the selected attempt before
        if(attempt.endTime) {
            return res.status(400).json({
                error: 'Cannot resubmit the quiz attempt. Please restart the quiz first and submit the attempt again.'
            });
        }

        // Give a null value to unanswered questions
        const processedAnswers = answers === undefined ? [] : answers;
        const answeredQuestionIDs = processedAnswers.map(row => row.questionID);
        const questions = await Question.findByQuizId(attempt.quizID);
        for (question of questions) {
            if (!answeredQuestionIDs.includes(question.questionID)) {
                processedAnswers.push({
                        'questionID': question.questionID,
                        'optionID': null
                    })
            }
        }

        // Try registering each attempt answer
        let correctCount = 0;
        const counter = {}
        for (const answer of processedAnswers) {
            try {
                const newAnswer = await registerAnswer(attempt, answer, client);
                const { questionID } = answer;
                console.log(questionID)
                counter[questionID] = (counter[questionID] || 0) + 1;
                if (newAnswer.attemptAnswer.isCorrect) {
                    correctCount++;
                }
            } catch(error) {
                return res.status(400).json({
                    error: error.message
                });
            };
        };

        // Validate if there is any question with multiple answers
        const duplicates = Object.entries(counter).filter(([_, count]) => count > 1).map(([questionID]) => questionID);
        if (duplicates.length > 0) {
            return res.status(400).json({
                error: 'Multiple answers found in the same question. Each question can take only one answer.'
            });
        }

        // Calculate the score and judge if the user passed the quiz or not
        const totalQuestions = (await Question.findByQuizId(attempt.quizID, client)).length;
        const score = correctCount / totalQuestions;
        const passed = score >= 0.8;

        const updatedAttempt = await QuizAttempt.submit({
            attemptID: attempt.attemptID, 
            score: score,
            passed: passed
        }, client);

        const attemptResults = await AttemptAnswer.findByAttemptID(attempt.attemptID, client);

        res.json({
            message: 'Attempt submitted successfully',
            attempt: {
                attemptID: updatedAttempt.attemptID,
                quizID: updatedAttempt.quizID,
                enrolmentID: updatedAttempt.enrolmentID,
                count: updatedAttempt.count,
                startTime: updatedAttempt.startTime,
                endTime: updatedAttempt.endTime,
                score: updatedAttempt.score,
                passed: updatedAttempt.passed,
                answers : attemptResults
            }
        });

        await client.query('COMMIT');
    } catch(error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: `Registration error:${error.message}`  });
    } finally {
        client.release();
    }
};



const getQuizResult = async (req, res) => {
    try{
        const { attemptID } = req.params;

        // Validate if attemptID and enrolmentID are provided
        if (!attemptID) {
            return res.status(400).json({
                error: 'Attempt ID and enrolment ID are required.'
            });
        }

        // Validate if attemptID exists
        const attempt = await QuizAttempt.findById(attemptID);
        if (!attempt) {
            return res.status(400).json({
                error: 'Attempt ID not found.'
            });
        }

        // Get options under the attemp
        const answers = await AttemptAnswer.findByAttemptID(attempt.attemptID);
        attempt.answers = answers;

        res.json(attempt);
    } catch(error) {
        console.error('Get quiz result error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

}

module.exports = {
    startAttempt,
    submitAttemp,
    getQuizResult
};