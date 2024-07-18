const User = require("../../../schema/base/users");
const Sessions = require("../../../schema/auth/sessions");
const Course = require("../../../schema/courses/courses");
const { default: mongoose } = require("mongoose");
module.exports = {
  Query: {
    getAllUsers: async (parent, args, context) => {
      try {
        const users = await User.find()
          .select("username email password")
          .lean();

        if (!users || users.length === 0) {
          return {
            success: false,
            message: "No users found",
          };
        }

        return {
          success: true,
          message: "Users fetched successfully",
          users: users,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    getUserById: async (parent, args, context) => {
      try {
        const user = await User.findOne({ _id: args.id });

        if (!user)
          return {
            success: false,
            message: "No users found",
          };
        // console.log(user);
        return {
          success: true,
          message: "User fetched successfully",
          user: user,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    getUserSessions: async (_, args, { req }) => {
      try {
        const sessionId = req.headers["id"];
        const session = await Sessions.findById(sessionId);
        if (!session) {
          return {
            success: false,
            message: "Session not found",
          };
        }
        const userId = new mongoose.Types.ObjectId(session.userId);
        const userSessions = await Sessions.aggregate([
          {
            $match: { userId },
          },
          {
            $project: {
              _id: 0,
              sessionId: "$_id",
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              time: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: "$createdAt",
                },
              },
              location: "$locationInfo.country",
              device: "$deviceInfo.client.name",
            },
          },
        ]);

        return {
          success: true,
          message: "Sessions fetched successfully",
          userId,
          count: userSessions.length,
          sessions: userSessions,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
    getUsernames: async (_, args, context) => {
      try {
        const regex = new RegExp(args.username, "i");
        const users = await User.find({ username: regex }).select(
          "username _id"
        );

        return {
          success: true,
          message: "Usernames fetched successfully",
          users: users.map((user) => ({
            username: user.username,
            userId: user._id,
          })),
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    deleteSession: async (_, { sessionId }, context) => {
      try {
        const deletedSession = await Sessions.findOneAndDelete({
          _id: sessionId,
        });
        if (deletedSession) {
          return {
            success: true,
            message: "Session deleted successfully",
          };
        } else {
          return {
            success: true,
            message: "Session not found",
          };
        }
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    suspendAccount: async (_, { userId }, context) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            success: false,
            message: "Invalid userId",
          };
        }
        const user = await User.findById(userId);

        if (!user) {
          return {
            success: false,
            message: "User not found",
          };
        }

        if (user.isSuspended) {
          return {
            success: false,
            message: `User ${user.username}'s A/c is already suspended`,
          };
        }

        (user.isSuspended = true), await user.save();
        return {
          success: true,
          message: `User ${user.username}'s A/c is suspended`,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    approveCourseSuspend: async (_, { courseId }, context) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return {
            success: false,
            message: "Invalid courseId",
          };
        }

        const course = await Course.findById(courseId);
        if (!course) {
          return {
            success: false,
            message: "Course not found",
          };
        }

        if (!course.suspendRequest) {
          return {
            success: false,
            message: "No suspension request found",
          };
        }

        course.isSuspend = true;
        course.suspendRequest = false;
        await course.save();

        return res.status(200).json({
          success: true,
          message: "Request Approved",
          course: course,
        });
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    approveCourse: async (_, { courseId }, context) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return {
            success: false,
            message: "Invalid courseId",
          };
        }

        const course = await Course.findById(courseId);
        if (!course) {
          return {
            success: false,
            message: "Course not found",
          };
        }

        if (course.isApproved) {
          return {
            success: false,
            message: "Course is already Approved",
          };
        }

        course.isApproved = true;

        await course.save();

        return {
          success: true,
          message: "Course Approved Successfully",
          course: course,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
  },
};
