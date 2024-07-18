const { loadFilesSync } = require("@graphql-tools/load-files");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { applyMiddleware } = require("graphql-middleware");
const {
  validateLoginInput,
  validateSignupInput,
  validatePasswordReset,
  validEmail,
  validOtp,
  validPage,
  validId,
  validRole,
  validRoleId,
  validateCourseInput,
} = require("./mid/validations/validations");
const {
  createQueryValidation,
  resolveQueryValidation,
  followQueryValidation,
} = require("./mid/validations/queryValidation");
const {
  internshipValidation,
  selectedInternValidation,
  validGenerateCertificate,
  interviewValidation,
} = require("./mid/validations/internshipValidation");

const typesArray = loadFilesSync("**/*", {
  extensions: ["graphql"],
});

const ResolverArray = loadFilesSync("**/*", {
  extensions: ["resolvers.js"],
});

const schema = makeExecutableSchema({
  typeDefs: typesArray,
  resolvers: ResolverArray,
});

const schemaWithMiddleware = applyMiddleware(schema, {
  Query: {
    getPaginatedPermissions: validPage,
    getPermissionById: validId,
    getRoleById: validRoleId,
    getPaginatedRoles: validPage,
    getUserById: validId,
  },
  Mutation: {
    login: validateLoginInput,
    signup: validateSignupInput,
    signup_verify: validOtp,
    reset_password_token: validEmail,
    reset_password: validatePasswordReset,
    deletePermission: validId,
    addRole: validRole,
    // updateRole: [validRole, validRoleId],
    deleteRole: validRoleId,
    addCourse: validateCourseInput,
    addQuery: createQueryValidation,
    resolveQueryMentor: resolveQueryValidation,
    resolveQueryManager: resolveQueryValidation,
    addFollowupQuery: followQueryValidation,
    addInternship: internshipValidation,
    addSelectedIntern: selectedInternValidation,
    generateInternPDF: validGenerateCertificate,
    selectProvisionalIntern: selectedInternValidation,
    scheduleInterview: interviewValidation,
  },
});

module.exports = schemaWithMiddleware;
