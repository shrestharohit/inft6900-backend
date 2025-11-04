-- ============================================================
-- Database Schema for Brainwave Application
-- ============================================================

-- ==================
-- USER & ROLES
-- ==================
CREATE TABLE "tblUser" (
    "userID" SERIAL PRIMARY KEY,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "otpCode" VARCHAR(6),
    "otpExpiresAt" TIMESTAMP,
    "isEmailVerified" BOOLEAN DEFAULT FALSE,
    "notificationEnabled" BOOLEAN DEFAULT TRUE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================
-- USER SETTINGS 
-- ==================
CREATE TABLE "tblPomodoroSetting" (
    "pomodoroID" SERIAL PRIMARY KEY,
    "userID" INT NOT NULL UNIQUE,
    "isEnabled" BOOLEAN DEFAULT TRUE,
    "focusPeriod" TIME DEFAULT '00:25:00',
    "breakPeriod" TIME DEFAULT '00:05:00',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userID") REFERENCES "tblUser"("userID") ON DELETE CASCADE
);

-- ==================
-- PATHWAY & COURSES
-- ==================
CREATE TABLE "tblPathway" (
    "pathwayID" SERIAL PRIMARY KEY,
    "name" VARCHAR(150) NOT NULL,
    "userID" INT NOT NULL,
    "outline" TEXT,
    "status" VARCHAR(20) DEFAULT 'active',
    "createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userID") REFERENCES "tblUser"("userID") ON DELETE CASCADE
);

CREATE TABLE "tblCourse" (
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
    FOREIGN KEY ("userID") REFERENCES "tblUser"("userID") ON DELETE CASCADE,
    FOREIGN KEY ("pathwayID") REFERENCES "tblPathway"("pathwayID") ON DELETE SET NULL
);

CREATE TABLE "tblModule" (
    "moduleID" SERIAL PRIMARY KEY,
    "courseID" INT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "moduleNumber" INT NOT NULL,
    "expectedHours" TIME,
    "status" VARCHAR(20),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("courseID") REFERENCES "tblCourse"("courseID") ON DELETE CASCADE,
    UNIQUE ("courseID", "moduleNumber")
);

-- ==================
-- ENROLMENTS & ACCESS
-- ==================
CREATE TABLE "tblEnrolment" (
    "enrolmentID" SERIAL PRIMARY KEY,
    "enrolDate" DATE DEFAULT CURRENT_DATE,
    "pathwayID" INT,
    "courseID" INT,
    "userID" INT NOT NULL,
    "status" VARCHAR(50),
    "completionDate" DATE,
    "disenrolledDate" DATE,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("pathwayID") REFERENCES "tblPathway"("pathwayID"),
    FOREIGN KEY ("courseID") REFERENCES "tblCourse"("courseID"),
    FOREIGN KEY ("userID") REFERENCES "tblUser"("userID") ON DELETE CASCADE
);

-- ==================
-- CONTENT & QUIZZES
-- ==================
CREATE TABLE "tblContent" (
    "contentID" SERIAL PRIMARY KEY,
    "moduleID" INT NOT NULL,
    "title" VARCHAR(150),
    "description" TEXT,
    "pageNumber" INT,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("moduleID") REFERENCES "tblModule"("moduleID") ON DELETE CASCADE
);

CREATE TABLE "tblQuiz" (
    "quizID" SERIAL PRIMARY KEY,
    "moduleID" INT NOT NULL,
    "title" VARCHAR(150),
    -- totalMarks INT,
    "timeLimit" TIME,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("moduleID") REFERENCES "tblModule"("moduleID") ON DELETE CASCADE
);

CREATE TABLE "tblQuestion" (
    "questionID" SERIAL PRIMARY KEY,
    "quizID" INT NOT NULL,
    "questionNumber" INT NOT NULL,
    "questionText" TEXT NOT NULL,
    -- "questionType" VARCHAR(50), -- what is this for???
    "status" VARCHAR(50), -- to define if it's deleted or active
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("quizID") REFERENCES "tblQuiz"("quizID") ON DELETE CASCADE
);

CREATE TABLE "tblAnswerOption" (
    "optionID" SERIAL PRIMARY KEY,
    "questionID" INT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN DEFAULT FALSE,
    "optionOrder" INT,
    "feedbackText" TEXT,
    "status" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("questionID") REFERENCES "tblQuestion"("questionID") ON DELETE CASCADE
);

-- ==================
-- ATTEMPTS & FEEDBACK
-- ==================
CREATE TABLE "tblQuizAttempt" (
    "attemptID" SERIAL PRIMARY KEY,
    "quizID" INT NOT NULL,
    "enrolmentID" INT NOT NULL,
    "startTime" TIMESTAMP,
    "endTime" TIMESTAMP,
    "score" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "count" INT, -- required to manage multiple attempts
    FOREIGN KEY ("quizID") REFERENCES "tblQuiz"("quizID") ON DELETE CASCADE,
    FOREIGN KEY ("enrolmentID") REFERENCES "tblEnrolment"("enrolmentID") ON DELETE CASCADE
);

CREATE TABLE "tblAttemptAnswer" (
    "attemptAnswerID" SERIAL PRIMARY KEY,
    "attemptID" INT NOT NULL,
    "questionID" INT NOT NULL,
    "optionID" INT,
    "isCorrect" BOOLEAN,
    FOREIGN KEY ("attemptID") REFERENCES "tblQuizAttempt"("attemptID") ON DELETE CASCADE,
    FOREIGN KEY ("questionID") REFERENCES "tblQuestion"("questionID") ON DELETE CASCADE,
    FOREIGN KEY ("optionID") REFERENCES "tblAnswerOption"("optionID") ON DELETE CASCADE
);

-- ==================
-- COURSE REVIEW
-- ==================
CREATE TABLE "tblCourseReview" (
    "reviewID" SERIAL PRIMARY KEY,
    "enrolmentID" INT NOT NULL,
    "comment" TEXT,
    "rating" INT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("enrolmentID") REFERENCES "tblEnrolment"("enrolmentID") ON DELETE CASCADE
);

-- ==================
-- DISCUSSION BOARD
-- ==================
CREATE TABLE "tblDiscussionBoard" (
    "postID" SERIAL PRIMARY KEY,
    "courseID" INT NOT NULL,
    "userID" INT NOT NULL,
    "title" TEXT NOT NULL,
    "postText" TEXT NOT NULL,
    "parentPostID" INT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    FOREIGN KEY ("courseID") REFERENCES "tblCourse"("courseID"),
    FOREIGN KEY ("userID") REFERENCES "tblUser"("userID"),
    FOREIGN KEY ("parentPostID") REFERENCES "tblDiscussionBoard"("postID") ON DELETE CASCADE
);

-- ==================
-- DIRECT MESSAGE FOR QUESTIONS
-- ==================
CREATE TABLE "tblDirectMessage" (
    "msgID" SERIAL PRIMARY KEY,
    "enrolmentID" INT NOT NULL,
    "message" VARCHAR(200) NOT NULL,
    "reply" VARCHAR(50),
    "status" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("enrolmentID") REFERENCES "tblEnrolment"("enrolmentID") ON DELETE CASCADE
);

-- ==================
-- SCHEDULE
-- ==================
CREATE TABLE "tblSchedule" (
    "scheduleID" SERIAL PRIMARY KEY,
    "userID" INT NOT NULL,
    "moduleID" INT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "totalHours" DECIMAL(4,2) GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM ("endTime" - "startTime")) / 3600
    ) STORED,
    FOREIGN KEY ("userID") REFERENCES "tblUser"("userID") ON DELETE CASCADE,
    FOREIGN KEY ("moduleID") REFERENCES "tblModule"("moduleID") ON DELETE CASCADE
);

-- ==================
-- ANNOUNCEMENT
-- ==================
CREATE TABLE "tblAnnouncement" (
    "announcementID" SERIAL PRIMARY KEY,
    "courseID" INT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("courseID") REFERENCES "tblCourse"("courseID") ON DELETE CASCADE
);

-- ==================
-- INDEXES
-- ==================
-- Index for faster email lookups
CREATE INDEX "idx_users_email" ON "tblUser"("email");
