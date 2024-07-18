const DeviceDetector = require("node-device-detector");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");
const ct = require("countries-and-timezones");
const nodemailer = require("nodemailer");
const otplib = require("otplib");
const User = require("../../../schema/base/users");
const Verify = require("../../../schema/auth/verify");
const Session = require("../../../schema/auth/sessions");
const mongoose = require("mongoose");
const Token = require("../../../schema/base/resetPassword");
const getUserRoleAndRoleId = require("../../../mid/rbac/getUserRoleAndRoleId");
const mailSender = require("../../../configs/mailSender");
// OTP Generator
const generateOTP = () => {
  const secret = otplib.authenticator.generateSecret();
  return otplib.authenticator.generate(secret);
};

module.exports = {
  Mutation: {
    login: async (parent, args, context) => {
      try {
        // Get the Device Information
        const { req } = context;

        const userAgent = req.headers["user-agent"];
        const detector = new DeviceDetector();
        const deviceInfo = detector.detect(userAgent);

        // User Authentication
        const { email, password } = args;
        console.log(email);
        console.log(password);

        const user = await User.findOne({ email, password });

        if (!user) {
          return {
            success: false,
            message: "User Not Found",
          };
        }

        if (user.isSuspended) {
          return {
            success: false,
            message: "Your A/c is suspended, You can't Login",
          };
        }

        // Get Location Information
        const clientIp = requestIp.getClientIp(req);
        const geo = geoip.lookup(clientIp);

        let locationInfo = {};
        if (geo) {
          locationInfo = {
            ip: clientIp,
            country_code: geo.country,
            country: ct.getCountry(geo.country)?.name,
            city: geo.city,
            latitude: geo.ll[0],
            longitude: geo.ll[1],
            timezone: geo.timezone,
          };
        }

        const session = await Session.create({
          userId: user._id,
          locationInfo,
          deviceInfo,
        });

        const { _id } = session;
        let userRole = await getUserRoleAndRoleId(_id);
        if (!userRole.length || !userRole[0].role) {
          userRole = [{ role: "user" }];
        }

        const userDetail = {
          token: _id,
          role: userRole[0].role,
          email: email,
          username: user.username,
        };

        return {
          success: true,
          message: "Login Successful",
          userDetail,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    signup: async (parent, args, { req }) => {
      try {
        const { email, password, confirmPassword, username } = args;

        console.log(process.env.MAIL_HOST);
        let confirmedUser = await User.findOne({ email });
        if (confirmedUser) {
          return { success: false, message: "USer already exits" };
        }

        let existingUser = await Verify.findOne({ email });
        if (existingUser) {
          return {
            success: false,
            message:
              "OTP already sent, Confirm the otp or try again later 1 day",
          };
        }

        let user = await Verify.create({
          email,
          password,
          username,
          otp: generateOTP(),
        });
        console.log(user);

        if (!user) {
          return {
            success: false,
            message: "Signup failed",
          };
        }
        let info = mailSender(email, "user OTP", user.otp);
        if (!info) {
          return { success: false, message: "Error in Sending Mail" };
        }

        return {
          success: true,
          message: "OTP sent to your email",
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    signup_verify: async (parent, args, { req }) => {
      try {
        const { email, otp } = args;

        let confirmedUser = await User.findOne({ email });
        if (confirmedUser) {
          return {
            success: false,
            message:
              "User already exists with this email, please login with your email",
          };
        }

        let existingUser = await Verify.findOne({ email });
        if (existingUser.otp !== otp) {
          return { success: false, message: "Invalid OTP" };
        }

        let addConfirmUser = await User.create({
          email: existingUser.email,
          password: existingUser.password,
          username: existingUser.username,
        });

        if (!addConfirmUser) {
          return { success: false, message: "signup failed" };
        }

        await Verify.deleteOne({ email });

        return { success: true, message: "User added successfully" };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    reset_password_token: async (parent, args, { req }) => {
      try {
        //get email from req body
        const { email } = args;

        //check user for this email, email validation
        const user = await User.findOne({ email });
        if (!user) {
          return {
            success: false,
            message: "Your email is not registerd with us",
          };
        }

        //generate token
        let token = await Token.findOne({ userId: user._id });
        if (!token) {
          token = await new Token({
            userId: user._id,
            token: new mongoose.Types.ObjectId(),
          }).save();
        }

        //create url
        const url = `http://localhost:3000/update-password/${token.token}`;
        //send mail containing the url
        await mailSender(
          email,
          "Password Reset Link",
          `Password Reset Link: ${url}. Please click on this url to reset your password.`
        );

        //return response
        return {
          success: true,
          message:
            "Email sent successfully, please check Email and change pssword",
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    reset_password: async (parent, args, { req }) => {
      try {
        const { password, confirmPassword, token } = args;

        if (password !== confirmPassword) {
          return {
            success: false,
            message: "Passwords do not match",
          };
        }
        const resetToken = await Token.findOne({ token });

        if (!resetToken) {
          return {
            success: false,
            message: "Password reset token is invalid or has expired.",
          };
        }

        const user = await User.findById(resetToken.userId);
        if (!user) {
          return { success: false, message: "User not found." };
        }

        user.password = password;
        await user.save();
        await resetToken.deleteOne();

        //return response
        return {
          success: true,
          message: "Password has been updated",
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    getUser: async (parent, args, { req }) => {
      try {
        const { username } = args;
        const user = await User.findOne({ username });

        if (!user)
          return {
            success: false,
            message: "User not found.",
          };

        return {
          success: true,
          email: user.email,
          username: user.username,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
  },
};
