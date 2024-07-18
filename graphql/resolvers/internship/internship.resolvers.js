const { default: mongoose } = require("mongoose");
const Internship = require("../../../schema/internship/internship");
const selectedIntern = require("../../../schema/internship/selectedIntern");
const applyIntern = require("../../../schema/internship/apply");
const Interview = require("../../../schema/internship/interview");
const generateCertificate = require("../../../utils/generateCertificate");

module.exports = {
  Mutation: {
    addInternship: async (_, args, context) => {
      try {
        const { name, description, techStack } = args;

        const internship = new Internship({ name, description, techStack });
        await internship.save();
        return {
          success: true,
          message: "Your application submited successfully",
          internship: internship,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    addSelectedIntern: async (_, args, context) => {
      try {
        const { userId, internId, duration, startDate, endDate } = args;
        const updatedIntern = await selectedIntern.findOneAndUpdate(
          { internId, userId, isProvisional: true },
          {
            $set: {
              duration,
              startDate,
              endDate,
              isProvisional: false,
            },
          },
          { new: true }
        );
        if (updatedIntern) {
          return {
            success: true,
            message:
              "Provisional intern converted to selected intern successfully",
          };
        } else {
          return {
            success: false,
            message: "No provisional intern found",
          };
        }
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },

    applyInternship: async (_, args, context) => {
      try {
        const { internId, userId } = args;
        if (!mongoose.Types.ObjectId.isValid(internId)) {
          return {
            success: false,
            message: "Invalid internId",
          };
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            success: false,
            message: "Invalid userId",
          };
        }

        const isAlreadyApplied = await applyIntern.findOne({
          internId,
          userId,
        });
        if (isAlreadyApplied) {
          return {
            success: false,
            message: "Already applied for internship",
          };
        }

        const applyForIntern = new applyIntern({ userId, internId });

        applyForIntern.save();
        return {
          success: true,
          message: "Applied for internship successfully",
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    generateInternPDF: async (_, args, context) => {
      try {
        const { userId, title, greetings } = args;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            success: false,
            message: "Invalid userId",
          };
        }
        const user = await selectedIntern
          .findOne({ userId })
          .populate("internId")
          .populate({
            path: "userId",
            select: "email", // Only populate the email field
          });

        // console.log(user);

        if (!user) {
          return {
            success: false,
            message: "User not found",
          };
        }

        const internDetails = {
          userId: userId,
          internId: user.internId,
          startDate: user.startDate,
          endDate: user.endDate,
          userEmail: user.userId.email,
          title: title,
          greetings: greetings,
        };

        await generateCertificate(internDetails);

        return {
          success: true,
          message: "Offer letter generated and sent successfully",
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    selectProvisionalIntern: async (_, args, context) => {
      try {
        const { userId, internId, duration, startDate, endDate } = args;

        const intern = await Internship.findById(internId);

        if (!intern) {
          return {
            success: false,
            message: "Internship application not found",
          };
        }

        const isAlreadyIntern = await selectedIntern.findOne({
          internId,
          userId,
        });
        if (isAlreadyIntern) {
          return {
            success: false,
            message: "Intern already selected",
          };
        }

        const selectIntern = new selectedIntern({
          internId,
          userId,
          duration,
          startDate,
          endDate,
          isProvisional: true,
        });
        await selectIntern.save();

        await Interview.findOneAndDelete({ userId, internId });

        return {
          success: true,
          message: "Provisional intern selected successfully",
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
    scheduleInterview: async (_, args, context) => {
      try {
        const { userId, internId, interviewDate, interviewer } = args;

        const isAppliedforInternship = await applyIntern.findOne({
          userId,
          internId,
        });
        if (!isAppliedforInternship) {
          return {
            success: false,
            message: "User is not applied for this internship",
          };
        }

        const alreadyScheduled = await Interview.findOne({ userId, internId });
        if (alreadyScheduled) {
          return {
            success: false,
            message: "Interview already scheduled",
          };
        }

        const alreadyIntern = await selectedIntern.findOne({
          userId,
          internId,
        });
        if (alreadyIntern) {
          return {
            success: false,
            message: "This user is already selected for internship",
          };
        }

        const interview = new Interview({
          userId,
          internId,
          interviewDate,
          interviewer,
        });
        await interview.save();

        return {
          success: true,
          message: "Interview scheduled successfully",
          interview: interview,
        };
      } catch (error) {
        console.log(`Error:`, error.message);
        throw new Error(error.message);
      }
    },
  },
};
