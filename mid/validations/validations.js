const { default: mongoose } = require("mongoose");

const validateLoginInput = async (resolve, root, args, context, info) => {
  try {
    const { email, password } = args;
    console.log("Inside middleware");

    // Validate email format ==> user@example.com || user@[192.168.0.1] || user@sub-domain.example.com || user@example.co.uk
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // At least one lowercase alphabet i.e. [a-z]
    // At least one uppercase alphabet i.e. [A-Z]
    // At least one Numeric digit i.e. [0-9]
    // At least one special character i.e. [‘@’, ‘$’, ‘.’, ‘#’, ‘!’, ‘%’, ‘*’, ‘?’, ‘&’, ‘^’, '_' , '-']
    // The total length must be in the range [8-65]
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\-@.#$!%*?&])[A-Za-z\d_\-@.#$!%*?&]{8,65}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 numeric digit, 1 special character, and be 8 to 65 characters long."
      );
    }

    // Proceed to the next resolver if validation passes
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle validation errors by throwing an error to the GraphQL client
    console.log(`Error`, err.message);
    throw new Error(err.message);
  }
};

const validateSignupInput = async (resolve, root, args, context, info) => {
  try {
    const { email, password, confirmPassword, username } = args;
    console.log("Inside Validate signup middleware");

    if (!email || !password || !confirmPassword || !username) {
      throw new Error("Required all the feilds");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Validate email format
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate password format
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\-@.#$!%*?&])[A-Za-z\d_\-@.#$!%*?&]{8,65}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 numeric digit, 1 special character, and be 8 to 65 characters long."
      );
    }

    // Validate username format
    const usernameRegex = /^[A-Za-z0-9_\-]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error(
        "Username must consist of only uppercase letters, lowercase letters, digits, underscores (_), and hyphens (-)."
      );
    }

    // Proceed to the next resolver if validation passes
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle validation errors by throwing an error to the GraphQL client
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

//valid domain
//Rule - domain only contains lowercase and Uppercase and digits
const validDomain = async (resolve, root, args, context, info) => {
  try {
    const { domain } = args;

    if (/^[a-zA-Z0-9]+$/.test(domain)) {
      return resolve(root, args, context, info);
    } else {
      throw new Error(
        "Invalid Domain. Domain must contain only Digits, Lowercase or Uppercase letters"
      );
    }
  } catch (err) {
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validatePasswordReset = async (resolve, root, args, context, info) => {
  try {
    const { password, confirmPassword } = args;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]{8,20}$/;

    // Check if password matches the required pattern
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 numeric digit, 1 special character, and be 8 to 20 characters long."
      );
    }

    // Check if confirmPassword matches the password
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    // If both validations pass, proceed to the next middleware or route handler
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validEmail = async (resolve, root, args, context, info) => {
  try {
    const { email } = args;
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validOtp = async (resolve, root, args, context, info) => {
  try {
    const { otp } = args;

    if (!otp) {
      throw new Error("OTP is required");
    }

    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(otp)) {
      throw new Error("Invalid OTP format. OTP must be a 6-digit number");
    }

    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validPage = async (resolve, root, args, context, info) => {
  const { page } = args;
  try {
    if (!page)
      throw new Error(
        "Page Value Not Found. Page value not given in request parameters"
      );

    if (/^[0-9]+$/.test(page) && page >= 1) {
      return resolve(root, args, context, info);
    } else {
      throw new Error(
        "Invalid Page format. Page field should be a valid positive number"
      );
    }
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validId = async (resolve, root, args, context, info) => {
  try {
    const { id } = args;

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      return resolve(root, args, context, info);
    } else {
      throw new Error("Invalid ID format. Please provide a valid Id.");
    }
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validRoleId = async (resolve, root, args, context, info) => {
  try {
    const { id } = args;

    if (!isNaN(id) && id >= 1 && id <= 10) {
      return resolve(root, args, context, info);
    } else {
      throw new Error(
        "Invalid Role Id. Role ID should be a valid number between 1 and 10."
      );
    }
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validRole = async (resolve, root, args, context, info) => {
  try {
    const { id, name } = args;
    if (typeof id !== "number" || id < 1 || id > 10) {
      throw new Error(
        "Invalid Role ID. ID should be a valid number between 1 and 10"
      );
    }
    if (!/^[a-zA-Z]+$/.test(name)) {
      throw new Error("Invalid Role Name. Role Name must contain only letters");
    }
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

const validateCourseInput = async (resolve, root, args, context, info) => {
  try {
    const { title, description, modules, fees, coverImage, mentor } = args;

    const titleRegex = /^[a-zA-Z0-9\s]{3,100}$/; // Alphanumeric and spaces, 3-100 characters
    const descriptionRegex = /^[a-zA-Z0-9\s.,!?-]{10,500}$/; // Alphanumeric, spaces, and some punctuation, 10-500 characters
    const feesRegex = /^[0-9]{1,6}$/; // Numeric, up to 6 digits
    const base64ImageRegex = /^data:image\/jpeg;base64,/; // Base64 image data

    // Validate title
    if (!titleRegex.test(title)) {
      throw new Error(
        "Invalid title format. Alphanumeric and spaces only, 3-100 characters."
      );
    }

    // Validate description
    if (!descriptionRegex.test(description)) {
      throw new Error(
        "Invalid description format. Alphanumeric, spaces, and some punctuation, 10-500 characters."
      );
    }

    // Validate fees
    if (!feesRegex.test(fees)) {
      throw new Error("Invalid fees format. Numeric value, up to 6 digits.");
    }

    // Validate coverImage
    if (coverImage && !base64ImageRegex.test(coverImage)) {
      throw new Error(
        "Invalid coverImage format. Must be a valid base64 encoded JPEG image."
      );
    }

    // Validate mentor (assuming it's a valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(mentor)) {
      throw new Error("Invalid mentor ID format.");
    }

    // Validate modules (assuming it's an array of objects)
    if (!Array.isArray(modules) || modules.length === 0) {
      throw new Error("Modules must be a non-empty array.");
    }

    // Validate each module object
    for (const mod of modules) {
      if (!titleRegex.test(mod.title)) {
        throw new Error(
          "Invalid module title format. Alphanumeric and spaces only, 3-100 characters."
        );
      }

      if (mod.description && !descriptionRegex.test(mod.description)) {
        throw new Error(
          "Invalid module description format. Alphanumeric, spaces, and some punctuation, 10-500 characters."
        );
      }

      if (!Array.isArray(mod.submodules)) {
        throw new Error("Submodules must be an array.");
      }
      for (const sub of mod.submodules) {
        if (!titleRegex.test(sub.title)) {
          throw new Error(
            "Invalid submodule title format. Alphanumeric and spaces only, 3-100 characters."
          );
        }

        if (sub.description && !descriptionRegex.test(sub.description)) {
          throw new Error(
            "Invalid submodule description format. Alphanumeric, spaces, and some punctuation, 10-500 characters."
          );
        }
        if (sub.content && typeof sub.content !== "string") {
          throw new Error("Submodule content must be a string.");
        }
      }
    }

    // If all validations pass, proceed to the next middleware or route handler
    return resolve(root, args, context, info);
  } catch (err) {
    // Handle any unexpected errors
    console.log(`Error:`, err.message);
    throw new Error(err.message);
  }
};

module.exports = {
  validateCourseInput,
  validateLoginInput,
  validateSignupInput,
  validDomain,
  validOtp,
  validEmail,
  validatePasswordReset,
  validPage,
  validId,
  validRole,
  validRoleId,
};
