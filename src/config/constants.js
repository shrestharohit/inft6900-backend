// Application Constants
const VALID_USER_ROLES = ['student', 'course_owner', 'admin'];

const VALID_COURSE_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
const VALID_COURSE_LEVEL = ['beginner', 'intermediate', 'advanced'];

const VALID_MODULE_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
const VALID_QUIZ_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
const VALID_QUESTION_STATUS = ['active', 'inactive'];
const VALID_OPTION_STATUS = ['active', 'inactive'];

const VALID_CONTENT_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
const VALID_PATHWAY_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
const VALID_BOARDPOST_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
const VALID_ANNOUNCEMENT_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];

const VALID_ENROLMENT_STATUS = ['enrolled', 'in progress', 'completed', 'disenrolled'];

const VALID_REVIEW_STATUS = ['active', 'inactive'];

const VALID_NOTIFICATIONSETTING_TYPE = {
  1: {
    event: 'Received new request for approval',
    role: 'admin'
  },
  2: {
    event: 'Item (Course/Quiz/Module) approved',
    role: 'course_owner'
  },
  3: {
    event: 'Item (Course/Quiz/Module) declined',
    role: 'course_owner'
  },
  4: {
    event: 'New post on Discussion Board',
    role: 'course_owner'
  },
  5: {
    event: 'New message on Direct Message',
    role: 'course_owner'
  },
  6: {
    event: 'Received new review',
    role: 'course_owner'
  },
  7: {
    event: 'Reply on Discussion Board',
    role: 'student'
  },
  8: {
    event: 'Reply on Direct Message',
    role: 'student'
  },
  9: {
    event: 'Complete course',
    role: 'student'
  },
  10: {
    event: 'Complete pathway',
    role: 'student'
  }
}

module.exports = {
  VALID_USER_ROLES,
  VALID_COURSE_STATUS,
  VALID_COURSE_LEVEL,
  VALID_MODULE_STATUS,
  VALID_QUIZ_STATUS,
  VALID_CONTENT_STATUS,
  VALID_QUESTION_STATUS,
  VALID_OPTION_STATUS,
  VALID_PATHWAY_STATUS,
  VALID_ENROLMENT_STATUS,
  VALID_REVIEW_STATUS,
  VALID_NOTIFICATIONSETTING_TYPE
};
