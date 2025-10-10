const CourseReview = require('../models/CourseReview');
const User = require('../models/User');
const Enrolment = require('../models/Enrolment');
const Course = require('../models/Course');
const Pathway = require('../models/Pathway');
const { VALID_REVIEW_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const { userID, courseID, comment, rating } = req.body;

        // Basic validataion
        if (!userID || !courseID || !rating) {
            return res.status(400).json({ 
                error: 'User ID, Course ID and rating are required' 
            });
        };

        // Validate course ID
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        };

        // Validate user ID
        const user = await User.findById(userID);
        if (!user) {
            return res.status(400).json({
                error: 'Invalid user ID. User does not exist.'
            });
        };

        // Validate enrolment (allow only enrolled user to give reviews)
        const enrolment = await Enrolment.findByCourseIdUserID(courseID, userID);
        if (!enrolment) {
            return res.status(400).json({
                error: 'Enrolment not found. Cannot post review for non-enrolling course'
            });
        };

        // Check if review has been already made
        const existingReview = await CourseReview.findByUserIDCourseID(userID, courseID)
        if (existingReview.length !== 0) {
            return res.status(400).json({
                error: 'Review has been already made. Cannot post more than 1 review'
            });
        };

        // Validate rating (has to be between 1-5)
        if (rating > 5 && rating < 1) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            });
        };
        
        // Create review
        const newReview = await CourseReview.create({
            userID,
            courseID,
            comment,
            rating
        });

        res.json({
            message: 'Review posted successfully',
            review: newReview
        })


    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const update = async (req, res) => {
    try {
        const reviewID = req.params.reviewID;
        const { comment, rating, status } = req.body;

        // Basic validataion
        if (!reviewID) {
            return res.status(400).json({ 
                error: 'Review ID is required' 
            });
        };

        // Validate review ID
        const review = await CourseReview.findById(reviewID, ['active', 'inactive']);
        if (!review) {
            return res.status(400).json({
                error: 'Invalid review ID. Review does not exist.'
            });
        };

        // Validate rating (has to be between 1-5)
        if (rating > 5 && rating < 1) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            });
        };
        
        // Validate status
        if (status && !VALID_REVIEW_STATUS.includes(status)) {
            return res.status(400).json({
                error: `Invalid role. Must be: ${VALID_REVIEW_STATUS.join(', ')}`
            });
        };
        
        // Prepare update data
        const updateData = {};
        if (comment !== undefined) updateData.comment = comment;
        if (rating !== undefined) updateData.rating = rating;
        if (status !== undefined) updateData.status = status;

        // Update module
        const udpatedReview = await CourseReview.update(reviewID, updateData);

        res.json({
            message: 'Reveiw updated successfully',
            review: udpatedReview
        });

    } catch(error) {
        console.error('Reveiw module error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCourseReviews = async (req, res) => {
    try {
        const courseID = req.params.courseID;

        // Basic validataion
        if (!courseID) {
            return res.status(400).json({ 
                error: 'Course ID is required' 
            });
        };

        const review = await processCourseReviews(courseID);        
        res.json({
            reviews: review.reviewws,
            avgRating: review.avgRating,
            course: review.course
        });

    } catch (error) {
        console.error('Get course review error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getPathwayReviews = async (req, res) => {
    try {
        const pathwayID = req.params.pathwayID;

        // Basic validataion
        if (!pathwayID) {
            return res.status(400).json({ 
                error: 'Pathway ID is required' 
            });
        };

        // Validate course ID
        const pathway = await Pathway.findById(pathwayID);
        if (!pathway) {
            return res.status(400).json({
                error: 'Invalid pathway ID. Pathway does not exist.'
            });
        };
        
        // Get courses under pathway
        const courses = await Course.findByPathwayId(pathway.pathwayID);
        const reviews = [];
        for (const course of courses) {
            let review = await processCourseReviews(course.courseID);
            reviews.push({
                course: course,
                reviews: review.reviews,
                avgRating: review.avgRating
            });
        }

        res.json(reviews);

    } catch (error) {
        console.error('Get course review error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getUserReviews = async (req, res) => {
    try {
        const userID = req.params.userID;

        // Basic validataion
        if (!userID) {
            return res.status(400).json({ 
                error: 'User ID is required' 
            });
        };

        // Validate course ID
        const user = await User.findById(userID);
        if (!user) {
            return res.status(400).json({
                error: 'Invalid user ID. User does not exist.'
            });
        };
        
        // Get reviews
        const reviews = await CourseReview.findByUserID(userID);
        let processedData = reviews;
        for (const row of processedData) {
            let course = await Course.findById(row.courseID);
            row.course = course;
        }

        res.json(processedData);
    } catch (error) {
        console.error('Get user posted review error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const getReview = async (req, res) => {
    try {
        const reviewID = req.params.reviewID;

        // Basic validataion
        if (!reviewID) {
            return res.status(400).json({ 
                error: 'Reveiw ID is required' 
            });
        };

        // Validate review
        const review = await CourseReview.findById(reviewID);
        if (!review) {
            return res.status(400).json({ 
                error: 'Reveiw does not exsist' 
            });
        };

        // Get related data
        const course = await Course.findById(review.courseID);
        const user = await User.findById(review.userID);

        res.json({
            review: review,
            course: course,
            user: user
        });

    } catch (error) {
        console.error('Get review error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getTopReviews = async (req, res) => {
    try {
        const reviews = await CourseReview.getTopReviews();
        let topReviews = []
        if (reviews.length > 3) {
            for (reviews, i=reviews.length; i--;) {
                var rand = reviews.splice(Math.floor(Math.random() * (i+1)), 1)[0];
                topReviews.push(rand);
                if (topReviews.length >= 3) {
                    break;
                }
            }
        } else {
            topReviews = reviews;
        }

        res.json({
            reviews: topReviews
        });

    } catch (error) {
        console.error('Get review error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getMeta = (req, res) => {
    res.json({
        status: VALID_REVIEW_STATUS,
    })
}



const processCourseReviews = async(courseID) => {
    // Validate course ID
    const course = await Course.findById(courseID);
    if (!course) {
        throw new Error('Invalid course ID. Course does not exist.');
    };
    
    // Get reviews
    const reviewws = await CourseReview.findByCourseID(courseID);
    const avgRating = await CourseReview.getAvgRatings(courseID);
    
    return {
        reviews: reviewws,
        avgRating: avgRating? avgRating.AvgRating : 0.0,
        course: course
    };
}


module.exports = {
  register,
  update,
  getCourseReviews,
  getPathwayReviews,
  getUserReviews,
  getReview,
  getTopReviews,
  getMeta
};