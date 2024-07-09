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

module.exports = {
  validateLoginInput,
  validateSignupInput,
  validDomain,
  validOtp,
  validEmail,
  validatePasswordReset,
};
