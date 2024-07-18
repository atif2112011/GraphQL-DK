const mongoose = require("mongoose");

const createQueryValidation = async (resolve, root, args, context, info) => {
  try {
    const { title, description, courseId, userId, mmId } = args;
    if (!mongoose.Types.ObjectId.isValid(mmId)) {
      throw new Error("Invalid mentor or manager Id");
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new Error("Invalid courseId");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    // Regular expressions for validation
    const titleRegex = /^[a-zA-Z0-9\s]{5,100}$/;
    const descriptionRegex = /^.{10,500}$/;

    // Validate name
    if (!title || !titleRegex.test(title)) {
      throw new Error(
        "Title should be alphanumeric and between 5 to 100 characters"
      );
    }

    // Validate description
    if (!description || !descriptionRegex.test(description)) {
      throw new Error("Invalid description format. Must be 10-500 characters.");
    }

    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const resolveQueryValidation = async (resolve, root, args, context, info) => {
  try {
    const { queryId, userId, resolveMessage } = args;

    if (!mongoose.Types.ObjectId.isValid(queryId)) {
      throw new Error("Invalid queryId");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    const resolveRegex = /^[\w\s.,!?-]{10,200}$/;

    // Validate description
    if (!resolveMessage || !resolveRegex.test(resolveMessage)) {
      throw new Error(
        "Invalid resolveMessage format. It should be alphanumeric and between 10 to 200 characters."
      );
    }

    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const followQueryValidation = async (resolve, root, args, context, info) => {
  try {
    const { title, description, courseId, userId, parentQueryId } = args;
    if (!mongoose.Types.ObjectId.isValid(parentQueryId)) {
      throw new Error("Invalid Parent Query Id");
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new Error("Invalid courseId");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    // Regular expressions for validation
    const titleRegex = /^[a-zA-Z0-9\s]{5,100}$/;
    const descriptionRegex = /^.{10,500}$/;

    // Validate name
    if (!title || !titleRegex.test(title)) {
      throw new Error(
        "Title should be alphanumeric and between 5 to 100 characters"
      );
    }

    // Validate description
    if (!description || !descriptionRegex.test(description)) {
      throw new Error("Invalid description format. Must be 10-500 characters.");
    }

    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};
module.exports = {
  createQueryValidation,
  resolveQueryValidation,
  followQueryValidation,
};
