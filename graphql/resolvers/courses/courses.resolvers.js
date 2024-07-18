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
const path = require("path");
const fs = require("fs");
module.exports = {
  Query: {
    getCourses: async (_, args, context) => {
      try {
        const courses = await Course.find({
          isSuspend: false,
          isApproved: true,
        });

        return {
          success: true,
          message: "Course Fetched Successfullly",
          courses: courses,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    getCourseById: async (_, { courseId }, context) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return {
            success: false,
            message: "Invalid courseId",
          };
        }

        const course = await Course.findById(courseId)
          .populate({
            path: "modules",
            populate: {
              path: "lessons",
            },
          })
          .exec();

        if (!course) {
          return {
            success: false,
            message: "Course not found",
          };
        }

        return {
          success: true,
          message: "Course fetched successfully",
          course: course,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    addCourse: async (_, args, context) => {
      try {
        const { title, description, modules, fees, coverImage, mentor } = args;

        const courseId = new mongoose.Types.ObjectId();

        // const isMentor = await Permissions.findOne({ userId: mentor, roleId: 4 });
        const isMentor = await Permissions.findOne({
          userId: mentor,
          roleId: 4,
        });

        if (!isMentor) {
          return {
            success: false,
            message: "Invalid role",
          };
        }

        const newCourse = new Course({
          _id: courseId,
          title: title,
          description: description,
          modules: [],
          fees: fees,
          mentor: mentor,
        });

        const savedModules = await Promise.all(
          modules.map(async (mod, index) => {
            const newModule = new Module({
              title: mod.title,
              description: mod.description || "", // Adjust as necessary
              order: index + 1,
              courseId: courseId,
            });
            const savedModule = await newModule.save();

            const savedLessons = await Promise.all(
              mod.submodules.map(async (sub) => {
                //   console.log("sub", sub);
                const newLesson = new Lesson({
                  title: sub.title || "",
                  description: sub.description || "",
                  content: sub.content || "",
                  moduleId: savedModule._id,
                });
                const savedLesson = await newLesson.save();
                return savedLesson._id;
              })
            );

            savedModule.lessons = savedLessons;
            await savedModule.save();
            newCourse.modules.push(savedModule._id);
            return savedModule;
          })
        );
        await newCourse.save();

        console.log(newCourse);
        const directoryPath = path.join(__dirname, "../images/course/4x3");

        // Create the directory if it doesn't exist
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }
        if (coverImage) {
          const imagePath = path.join(
            directoryPath,
            `${newCourse._id}_4x3.jpg`
          );
          const base64Data = coverImage.replace(
            /^data:image\/jpeg;base64,/,
            ""
          );
          fs.writeFile(imagePath, base64Data, "base64", (err) => {
            if (err) {
              return {
                success: false,
                message: err.message,
              };
            }
          });
        }

        return {
          success: true,
          message: "Course Created Successfully",
          course: newCourse,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    deleteCourse: async (_, { courseId }, context) => {
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

        // Unenroll students from the course
        //   const studentsEnrolled = course.studentsEnrolled;
        //   for (const studentId of studentsEnrolled) {
        //     await User.findByIdAndUpdate(studentId, {
        //       $pull: { courses: courseId },
        //     });
        //   }

        //Delete modules
        const courseModules = course.modules;
        for (const moduleId of courseModules) {
          const module = await Module.findById(moduleId);
          if (module) {
            //Delete lessons
            const lession = module.lessons;
            for (const lessionId of lession) {
              await Lesson.findByIdAndDelete(lessionId);
            }
          }
          //Delete module
          await Module.findByIdAndDelete(moduleId);
        }
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
          success: true,
          message: "Course deleted successfully",
        });
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    requestCourseSuspend: async (_, { courseId, userId }, context) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return {
            success: true,
            message: "Invalid courseId",
          };
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            success: true,
            message: "Invalid userId",
          };
        }

        const isMentor = await Permissions.findOne({ userId, roleId: 4 });
        if (!isMentor) {
          return res.status(403).json({
            success: false,
            message: "Invalid role",
          });
        }

        const course = await Course.findByIdAndUpdate(
          courseId,
          { suspendRequest: true },
          { new: true }
        );

        if (!course) {
          return {
            success: false,
            message: "Course not found",
          };
        }

        return {
          success: true,
          message: "Suspend request Added",
          course: course,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    joinWaitlist: async (_, { courseId, userId }, context) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return {
            success: true,
            message: "Invalid courseId",
          };
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            success: true,
            message: "Invalid userId",
          };
        }
        const course = await Course.findById(courseId);
        if (!course) {
          return {
            success: false,
            message: "Course not found",
          };
        }

        const enrollment = await Enrollment.findOne({
          courseId,
          "enrolled.userId": userId,
        });
        if (enrollment) {
          return {
            success: false,
            message: "User is already enrolled in this course",
          };
        }

        let waitlist = await Waitlist.findOne({ courseId });

        if (!waitlist) {
          waitlist = new Waitlist({ courseId, joined: [] });
        }

        const isAlreadyJoined = waitlist.joined.some(
          (entry) => entry.userId.toString() === userId
        );

        if (isAlreadyJoined) {
          return {
            success: false,
            message: "User is already on the waitlist for this course",
          };
        }

        waitlist.joined.push({ userId });

        await waitlist.save();

        return {
          success: true,
          message: "User added to waitlist successfully",
          waitlist,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    enrollUser: async (_, { courseId, userId }, context) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return {
            success: true,
            message: "Invalid courseId",
          };
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            success: true,
            message: "Invalid userId",
          };
        }

        const course = await Course.findById(courseId);
        if (!course) {
          return { success: false, message: "Course not found" };
        }

        // Find the enrollment document for the course
        let enrollment = await Enrollment.findOne({ courseId });

        if (!enrollment) {
          // If no document exists for the course, create a new one
          enrollment = new Enrollment({ courseId, enrolled: [] });
        }

        // Check if the user is already enrolled
        const isAlreadyEnrolled = enrollment.enrolled.some(
          (entry) => entry.userId.toString() === userId
        );

        if (isAlreadyEnrolled) {
          return {
            success: false,
            message: "User is already enrolled in this course",
          };
        }

        // Add the new enrollment
        enrollment.enrolled.push({ userId });

        await enrollment.save();

        return {
          success: true,
          message: "User enrolled successfully",
          enrollment,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
  },
};
