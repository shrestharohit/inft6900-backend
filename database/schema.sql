-- Create database (run this first in psql)
-- CREATE DATABASE your_db_name;

-- ============================================================
-- Database Schema for Brainwave Application
-- ============================================================

-- ==================
-- USER & ROLES
-- ==================
CREATE TABLE "User" (
    "userID" SERIAL PRIMARY KEY,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "otpCode" VARCHAR(6),
    "otpExpiresAt" TIMESTAMP,
    "isEmailVerified" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- NOTIFICATIONS 
-- ==================
CREATE TABLE "NotificationSetting" (
    "settingID" SERIAL PRIMARY KEY,
    "userID" INT NOT NULL,
    "notificationType" VARCHAR(50),
    "enabled" BOOLEAN DEFAULT TRUE,
    "channel" VARCHAR(50),
    "createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE
);

-- ==================
-- PATHWAY & COURSES
-- ==================
CREATE TABLE "Pathway" (
    "pathwayID" SERIAL PRIMARY KEY,
    "name" VARCHAR(150) NOT NULL,
    "outline" TEXT,
    "status" VARCHAR(20),
    "createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Course" (
    "courseID" SERIAL PRIMARY KEY,
    "userID" INT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "category" VARCHAR(150) NOT NULL, -- added by Hide
    "level" VARCHAR(50),
    "outline" TEXT,
    "status" VARCHAR(20),
    "pathwayID" INT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE,
    FOREIGN KEY ("pathwayID") REFERENCES "Pathway"("pathwayID") ON DELETE SET NULL
);

CREATE TABLE "Module" (
    "moduleID" SERIAL PRIMARY KEY,
    "courseID" INT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "moduleNumber" INT UNIQUE NOT NULL,
    "expectedHours" TIME,
    "status" VARCHAR(20),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE,
    UNIQUE ("courseID", "moduleNumber")
);

-- ==================
-- ENROLMENTS & ACCESS
-- ==================
CREATE TABLE "Enrolment" (
    "enrolmentID" SERIAL PRIMARY KEY,
    "enrolDate" DATE DEFAULT CURRENT_DATE,
    "pathwayID" INT,
    "courseID" INT,
    "userID" INT NOT NULL,
    "status" VARCHAR(50),
    "completionDate" DATE,
    "disenrolledDate" DATE,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("pathwayID") REFERENCES "Pathway"("pathwayID"),
    FOREIGN KEY ("courseID") REFERENCES "Course"("courseID"),
    FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE
);

CREATE TABLE "ModuleAccess" (
    "accessID" SERIAL PRIMARY KEY,
    "moduleID" INT NOT NULL,
    "userID" INT NOT NULL,
    "accessDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "duration" INTERVAL,
    FOREIGN KEY ("moduleID") REFERENCES "Module"("moduleID") ON DELETE CASCADE,
    FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE
);

-- ==================
-- CONTENT & QUIZZES
-- ==================
CREATE TABLE "Content" (
    "contentID" SERIAL PRIMARY KEY,
    "moduleID" INT NOT NULL,
    "title" VARCHAR(150),
    "description" TEXT,
    "pageNumber" INT,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("moduleID") REFERENCES "Module"("moduleID") ON DELETE CASCADE
);

CREATE TABLE "Quiz" (
    "quizID" SERIAL PRIMARY KEY,
    "moduleID" INT NOT NULL,
    "title" VARCHAR(150),
    -- totalMarks INT,
    "timeLimit" TIME,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("moduleID") REFERENCES "Module"("moduleID") ON DELETE CASCADE
);

CREATE TABLE "Question" (
    "questionID" SERIAL PRIMARY KEY,
    "quizID" INT NOT NULL,
    "questionNumber" INT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" VARCHAR(50), -- what is this for???
    "status" VARCHAR(50), -- to define if it's deleted or active
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("quizID") REFERENCES "Quiz"("quizID") ON DELETE CASCADE
);

CREATE TABLE "AnswerOption" (
    "optionID" SERIAL PRIMARY KEY,
    "questionID" INT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN DEFAULT FALSE,
    "optionOrder" INT,
    "feedbackText" TEXT,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("questionID") REFERENCES "Question"("questionID") ON DELETE CASCADE
);

-- ==================
-- ATTEMPTS & FEEDBACK
-- ==================
CREATE TABLE "QuizAttempt" (
    "attemptID" SERIAL PRIMARY KEY,
    "quizID" INT NOT NULL,
    "enrolmentID" INT NOT NULL,
    "startTime" TIMESTAMP,
    "endTime" TIMESTAMP,
    "score" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "count" INT, -- required to manage multiple attempts
    FOREIGN KEY ("quizID") REFERENCES "Quiz"("quizID") ON DELETE CASCADE,
    FOREIGN KEY ("enrolmentID") REFERENCES "Enrolment"("enrolmentID") ON DELETE CASCADE
);

CREATE TABLE "AttemptAnswer" (
    "attemptAnswerID" SERIAL PRIMARY KEY,
    "attemptID" INT NOT NULL,
    "questionID" INT NOT NULL,
    "optionID" INT,
    "isCorrect" BOOLEAN,
    FOREIGN KEY ("attemptID") REFERENCES "QuizAttempt"("attemptID") ON DELETE CASCADE,
    FOREIGN KEY ("questionID") REFERENCES "Question"("questionID") ON DELETE CASCADE,
    FOREIGN KEY ("optionID") REFERENCES "AnswerOption"("optionID") ON DELETE CASCADE
);

-- CREATE TABLE "Feedback" (
--     "feedbackID" SERIAL PRIMARY KEY,
--     "attemptID" INT NOT NULL,
--     "comments" TEXT,
--     "createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY ("attemptID") REFERENCES "QuizAttempt"("attemptID") ON DELETE CASCADE
-- );

-- ==================
-- CERTIFICATES
-- ==================
CREATE TABLE "Certificate" (
    "certificateID" SERIAL PRIMARY KEY,
    "userID" INT NOT NULL,
    "courseID" INT,
    "issueDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "certificateURL" TEXT,
    FOREIGN KEY ("userID") REFERENCES "User"("userID"),
    FOREIGN KEY ("courseID") REFERENCES "Course"("courseID")
);

-- ==================
-- COURSE REVIEW
-- ==================
CREATE TABLE "CourseReview" (
    "reviewID" SERIAL PRIMARY KEY,
    "userID" INT NOT NULL,
    "courseID" INT NOT NULL,
    "comment" TEXT,
    "rating" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userID") REFERENCES "User"("userID"),
    FOREIGN KEY ("courseID") REFERENCES "Course"("courseID")
);

-- ==================
-- DISCUSSION BOARD
-- ==================
CREATE TABLE "DiscussionBoard" (
    "boardID" SERIAL PRIMARY KEY,
    "courseID" INT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE
);

CREATE TABLE "BoardPost" (
    "postID" SERIAL PRIMARY KEY,
    "boardID" INT NOT NULL,
    "userID" INT NOT NULL,
    "postText" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("boardID") REFERENCES "DiscussionBoard"("boardID") ON DELETE CASCADE,
    FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE
);

-- ==================
-- SCHEDULE
-- ==================
CREATE TABLE "Schedule" (
    "scheduleID" SERIAL PRIMARY KEY,
    "userID" INT NOT NULL,
    "moduleID" INT NOT NULL,
    "scheduledDateTime" TIMESTAMP NOT NULL,
    FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE,
    FOREIGN KEY ("moduleID") REFERENCES "Module"("moduleID") ON DELETE CASCADE
);

-- ==================
-- ANNOUNCEMENT
-- ==================
CREATE TABLE "Announcement" (
    "announcementID" SERIAL PRIMARY KEY,
    "courseID" INT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("courseID") REFERENCES "Course"("courseID") ON DELETE CASCADE
);

-- ==================
-- INDEXES
-- ==================
-- Index for faster email lookups
CREATE INDEX "idx_users_email" ON "User"("email");
