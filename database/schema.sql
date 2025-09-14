-- Create database (run this first in psql)
-- CREATE DATABASE your_db_name;

-- ============================================================
-- Database Schema for Brainwave Application
-- ============================================================
-- ==================
-- USER & ROLES
-- ==================
CREATE TABLE "User" (
    userID SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Learner (
    learnerID INT PRIMARY KEY,
    FOREIGN KEY (learnerID) REFERENCES "User"(userID) ON DELETE CASCADE
);

CREATE TABLE Admin (
    adminID INT PRIMARY KEY,
    roleLevel VARCHAR(50),
    FOREIGN KEY (adminID) REFERENCES "User"(userID) ON DELETE CASCADE
);

CREATE TABLE ModuleOwner (
    ownerID INT PRIMARY KEY,
    department VARCHAR(100),
    FOREIGN KEY (ownerID) REFERENCES "User"(userID) ON DELETE CASCADE
);

-- ==================
-- NOTIFICATIONS & SCHEDULE
-- ==================
CREATE TABLE NotificationSetting (
    settingID SERIAL PRIMARY KEY,
    userID INT NOT NULL,
    notificationType VARCHAR(50),
    enabled BOOLEAN DEFAULT TRUE,
    channel VARCHAR(50),
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES "User"(userID) ON DELETE CASCADE
);

CREATE TABLE Schedule (
    scheduleID SERIAL PRIMARY KEY,
    frequency VARCHAR(50),
    nextDueDate DATE
);

-- ==================
-- PATHWAY & COURSES
-- ==================
CREATE TABLE Pathway (
    pathwayID SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    createdDate DATE DEFAULT CURRENT_DATE
);

CREATE TABLE Course (
    courseID SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    level VARCHAR(50),
    description TEXT,
    status VARCHAR(20),
    pathwayID INT,
    FOREIGN KEY (pathwayID) REFERENCES Pathway(pathwayID) ON DELETE SET NULL
);

CREATE TABLE Module (
    moduleID SERIAL PRIMARY KEY,
    courseID INT NOT NULL,
    ownerID INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20),
    scheduleID INT,
    FOREIGN KEY (courseID) REFERENCES Course(courseID) ON DELETE CASCADE,
    FOREIGN KEY (ownerID) REFERENCES ModuleOwner(ownerID) ON DELETE CASCADE,
    FOREIGN KEY (scheduleID) REFERENCES Schedule(scheduleID) ON DELETE SET NULL
);

-- ==================
-- ENROLMENTS & ACCESS
-- ==================
CREATE TABLE Enrolment (
    enrolmentID SERIAL PRIMARY KEY,
    enrolDate DATE DEFAULT CURRENT_DATE,
    enrolmentType VARCHAR(50),
    pathwayID INT,
    courseID INT,
    learnerID INT NOT NULL,
    completionStatus VARCHAR(50),
    lastAccessDate DATE,
    completionDate DATE,
    FOREIGN KEY (pathwayID) REFERENCES Pathway(pathwayID),
    FOREIGN KEY (courseID) REFERENCES Course(courseID),
    FOREIGN KEY (learnerID) REFERENCES Learner(learnerID) ON DELETE CASCADE
);

CREATE TABLE ModuleAccess (
    accessID SERIAL PRIMARY KEY,
    moduleID INT NOT NULL,
    learnerID INT NOT NULL,
    accessDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INTERVAL,
    FOREIGN KEY (moduleID) REFERENCES Module(moduleID) ON DELETE CASCADE,
    FOREIGN KEY (learnerID) REFERENCES Learner(learnerID) ON DELETE CASCADE
);

-- ==================
-- CONTENT & QUIZZES
-- ==================
CREATE TABLE Content (
    contentID SERIAL PRIMARY KEY,
    moduleID INT NOT NULL,
    title VARCHAR(150),
    description TEXT,
    contentType VARCHAR(50),
    pageNumber INT,
    FOREIGN KEY (moduleID) REFERENCES Module(moduleID) ON DELETE CASCADE
);

CREATE TABLE Quiz (
    quizID SERIAL PRIMARY KEY,
    moduleID INT NOT NULL,
    title VARCHAR(150),
    totalMarks INT,
    timeLimit INT,
    FOREIGN KEY (moduleID) REFERENCES Module(moduleID) ON DELETE CASCADE
);

CREATE TABLE Question (
    questionID SERIAL PRIMARY KEY,
    quizID INT NOT NULL,
    questionText TEXT NOT NULL,
    questionType VARCHAR(50),
    FOREIGN KEY (quizID) REFERENCES Quiz(quizID) ON DELETE CASCADE
);

CREATE TABLE AnswerOption (
    optionID SERIAL PRIMARY KEY,
    questionID INT NOT NULL,
    optionText TEXT NOT NULL,
    isCorrect BOOLEAN DEFAULT FALSE,
    optionOrder INT,
    feedbackText TEXT,
    FOREIGN KEY (questionID) REFERENCES Question(questionID) ON DELETE CASCADE
);

-- ==================
-- ATTEMPTS & FEEDBACK
-- ==================
CREATE TABLE QuizAttempt (
    attemptID SERIAL PRIMARY KEY,
    quizID INT NOT NULL,
    enrolmentID INT NOT NULL,
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    score INT,
    passed BOOLEAN,
    FOREIGN KEY (quizID) REFERENCES Quiz(quizID) ON DELETE CASCADE,
    FOREIGN KEY (enrolmentID) REFERENCES Enrolment(enrolmentID) ON DELETE CASCADE
);

CREATE TABLE AttemptAnswer (
    attemptAnswerID SERIAL PRIMARY KEY,
    attemptID INT NOT NULL,
    questionID INT NOT NULL,
    optionID INT NOT NULL,
    answerText TEXT,
    isCorrect BOOLEAN,
    FOREIGN KEY (attemptID) REFERENCES QuizAttempt(attemptID) ON DELETE CASCADE,
    FOREIGN KEY (questionID) REFERENCES Question(questionID) ON DELETE CASCADE,
    FOREIGN KEY (optionID) REFERENCES AnswerOption(optionID) ON DELETE CASCADE
);

CREATE TABLE Feedback (
    feedbackID SERIAL PRIMARY KEY,
    attemptID INT NOT NULL,
    comments TEXT,
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attemptID) REFERENCES QuizAttempt(attemptID) ON DELETE CASCADE
);

-- ==================
-- INDEXES
-- ==================

-- Index for faster email lookups
CREATE INDEX idx_users_email ON "User"(email);
