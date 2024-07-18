const { default: mongoose } = require("mongoose");
const User = require("../../../schema/base/users");
const Sessions = require("../../../schema/auth/sessions");
const Course = require("../../../schema/courses/courses");
const Permissions = require("../../../schema/base/permissions");
const Roles = require("../../../schema/base/roles");
const Module = require("../../../schema/courses/modules");
const Lesson = require("../../../schema/courses/lessions");
const Enrollment = require("../../../schema/courses/enrolledStudents");
const Waitlist = require("../../../schema/courses/Waitlist");
const Query = require("../../../schema/courses/query");

module.exports = {
  Query: {
    getQueryMentor: async (_, args, context) => {
      try {
        const { userId } = args;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return { success: false, message: "Invalid userId" };
        }

        const isMentor = await Permissions.findOne({ userId, roleId: 4 });

        // console.log(isMentor);

        if (!isMentor) {
          return { success: false, message: "Invalid role" };
        }

        const query = await Query.find({ mmId: userId });
        // console.log(query);
        return {
          success: true,
          message: "Query fetched successfully",
          queries: query,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    getQueryManager: async (_, args, context) => {
      try {
        const { userId } = args;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return { success: false, message: "Invalid userId" };
        }

        const isManager = await Permissions.findOne({ userId, roleId: 3 });

        // console.log(isMentor);

        if (!isManager) {
          return { success: false, message: "Invalid role" };
        }

        const query = await Query.find({
          category: { $in: ["finance", "management"] },
          mmId: userId,
          status: "verified",
        });
        // console.log(query);
        return {
          success: true,
          message: "Query fetched successfully",
          queries: query,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    getQueryStudent: async (_, args, context) => {
      try {
        const { userId } = args;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return { success: false, message: "Invalid userId" };
        }

        const queries = await Query.find({ userId });
        // console.log(query);
        return {
          success: true,
          message: "Query fetched successfully",
          queries: queries,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    getQuerySupport: async (_, args, context) => {
      try {
        const { userId } = args;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return { success: false, message: "Invalid userId" };
        }

        const isSupport = await Permissions.findOne({ userId, roleId: 5 });

        // console.log(isMentor);

        if (!isSupport) {
          return { success: false, message: "Invalid role" };
        }

        const query = await Query.find({
          category: { $in: ["finance", "management"] },
          status: "open",
        });
        // console.log(query);
        return {
          success: true,
          message: "Query fetched successfully",
          queries: query,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    addQuery: async (_, args, context) => {
      try {
        // const data = {
        //     title: title,
        //     description: description,
        //     courseId: courseId,
        //     userId: userId,
        //     status: status,
        //     category: category,
        //     mmId: mmId,
        //   };
        const result = await Query.create(args);

        if (!result)
          return {
            success: false,
            message: "Error creating query",
          };

        return {
          success: true,
          message: "QUery created successfully",
          query: result,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    verifyQuery: async (_, args, context) => {
      try {
        const { queryId, userId } = args;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return { success: false, message: "Invalid userId" };
        }

        if (!mongoose.Types.ObjectId.isValid(queryId)) {
          return { success: false, message: "Invalid queryId" };
        }

        const isSupport = await Permissions.findOne({ userId, roleId: 5 });

        if (!isSupport) {
          return {
            success: false,
            message: "Invalid role",
          };
        }
        const query = await Query.findByIdAndUpdate(
          queryId,
          {
            status: "verified",
          },
          { new: true }
        );

        return {
          success: true,
          message: "Query verified successfully",
          query: query,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    resolveQueryMentor: async (_, args, context) => {
      try {
        const { queryId, userId, resolveMessage } = args;

        const isMentor = await Permissions.findOne({
          userId: userId,
          roleId: 4,
        });

        if (!isMentor) {
          return {
            success: false,
            message: "Invalid role",
          };
        }
        const query = await Query.findByIdAndUpdate(
          queryId,
          {
            status: "resolved",
            resolvedBy: userId,
            resolveMessage: resolveMessage,
          },
          { new: true }
        );
        return {
          success: true,
          message: "Query resolved successfully",
          query: query,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    resolveQueryManager: async (_, args, context) => {
      try {
        const { queryId, userId, resolveMessage } = args;

        const isManager = await Permissions.findOne({
          userId: userId,
          roleId: 3,
        });

        if (!isManager) {
          return {
            success: false,
            message: "Invalid role",
          };
        }
        const query = await Query.findByIdAndUpdate(
          queryId,
          {
            status: "resolved",
            resolvedBy: userId,
            resolveMessage: resolveMessage,
          },
          { new: true }
        );
        return {
          success: true,
          message: "Query resolved successfully",
          query: query,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    addFollowupQuery: async (_, args, context) => {
      try {
        const { title, description, courseId, userId, parentQueryId } = args;
        // Check if the parent query is resolved
        const parentQuery = await Query.findById(parentQueryId);
        if (!parentQuery || parentQuery.status !== "resolved") {
          return {
            success: false,
            message: "Parent query is not resolved or does not exist",
          };
        }

        const data = {
          title: title,
          description: description,
          courseId: courseId,
          userId: userId,
          status: "open",
          category: parentQuery.category,
          parentQueryId: parentQueryId,
          mmId: parentQuery.mmId,
        };
        const result = await Query.create(data);
        return {
          success: true,
          message: "Follow-Up added successfully",
          query: result,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
  },
};
