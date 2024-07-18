const mongoose = require("mongoose");

const internshipValidation = async (resolve, root, args, context, info) => {
  try {
    const { name, description, techStack } = args;

    // Regular expressions for validation
    const nameRegex = /^[a-zA-Z0-9\s]{3,50}$/;
    const descriptionRegex = /^.{3,500}$/;
    const techStackRegex = /^[a-zA-Z\s,]{3,100}$/;

    // Validate name
    if (!name || !nameRegex.test(name)) {
      throw new Error(
        "Invalid name format. Must be 3-50 alphanumeric characters."
      );
    }

    // Validate description
    if (!description || !descriptionRegex.test(description)) {
      throw new Error("Invalid description format. Must be 10-500 characters.");
    }

    // Validate techStack
    if (!techStack || !techStackRegex.test(techStack)) {
      throw new Error(
        "Invalid tech stack format. Must be 3-100 alphabetic characters separated by commas."
      );
    }
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const selectedInternValidation = async (resolve, root, args, context, info) => {
  try {
    const { internId, userId, duration, startDate, endDate } = args;
    // Regular expressions for validation
    const durationRegex = /^[1-9]\d*$/; // Positive integers
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format

    if (!mongoose.Types.ObjectId.isValid(internId)) {
      return res.status(400).send("Invalid internId");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid userId");
    }

    // Validate duration
    if (!duration || !durationRegex.test(duration)) {
      throw new Error("Invalid duration format. Must be a positive integer.");
    }

    // Validate startDate
    if (!startDate || !dateRegex.test(startDate)) {
      throw new Error("Invalid start date format. Must be YYYY-MM-DD.");
    }

    // Validate endDate
    if (!endDate || !dateRegex.test(endDate)) {
      throw new Error("Invalid end date format. Must be YYYY-MM-DD.");
    }

    // Check if endDate is after startDate
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).send("End date must be after start date.");
    }
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validGenerateCertificate = async (resolve, root, args, context, info) => {
  try {
    const { userId, title, greetings } = args;

    const titleRegex = /^[a-zA-Z0-9\s]{5,50}$/;
    const greetingsRegex = /^[a-zA-Z\s]{5,100}$/;

    if (!titleRegex.test(title)) {
      throw new Error(
        "Title should be alphanumeric and between 5 to 50 characters"
      );
    }

    // Validate greetings
    if (!greetingsRegex.test(greetings)) {
      throw new Error(
        "Greetings should be alphabetical and between 5 to 100 characters"
      );
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid userId");
    }
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const interviewValidation = async (resolve, root, args, context, info) => {
  try {
    const { internId, userId, interviewDate, interviewer } = args;
    // Regular expressions for validation

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
    const interviewerRegex = /^[a-zA-Z\s]+$/; // Only alphabets and spaces for interviewer name

    if (!mongoose.Types.ObjectId.isValid(internId)) {
      return res.status(400).send("Invalid internId");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid userId");
    }

    // Validate startDate
    if (!interviewDate || !dateRegex.test(interviewDate)) {
      throw new Error("Invalid interview date format. Must be YYYY-MM-DD.");
    }

    if (!interviewer.match(interviewerRegex)) {
      throw new Error(
        "Invalid interviewer name format. Only alphabets and spaces allowed"
      );
    }

    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

module.exports = {
  internshipValidation,
  selectedInternValidation,
  validGenerateCertificate,
  interviewValidation,
};
