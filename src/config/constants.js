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
  VALID_BOARDPOST_STATUS,
  VALID_ANNOUNCEMENT_STATUS
};
