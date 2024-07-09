const DeviceDetector = require("node-device-detector");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");
const ct = require("countries-and-timezones");
const nodemailer = require("nodemailer");
const otplib = require("otplib");
const User = require("../../schema/base/users");
const Verify = require("../../schema/auth/verify");
const Session = require("../../schema/auth/sessions");
const getUserRoleAndRoleId = require("../../mid/rbac/getUserRoleAndRoleId");
const mailSender = require("../../configs/mailSender");
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
        const userAgent = req.headers["user-agent"];
        const detector = new DeviceDetector();
        const deviceInfo = detector.detect(userAgent);

        // User Authentication
        const { email, password } = args;
        console.log(email);
        console.log(password);

        const user = await User.findOne({ email, password });

        if (!user) {
          throw new Error("User not found");
        }

        if (user.isSuspended) {
          throw new Error("Your A/C is suspended");
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

        return userDetail;
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
          throw new Error("USer already exits");
        }

        let existingUser = await Verify.findOne({ email });
        if (existingUser) {
          throw new Error(
            "OTP already sent, Confirm the otp or try again later 1 day"
          );
        }

        let user = await Verify.create({
          email,
          password,
          username,
          otp: generateOTP(),
        });
        console.log(user);

        if (!user) {
          throw new Error("Signup failed");
        }
        let info = mailSender(email, "user OTP", user.otp);
        if (!info) {
          throw new Error("Error in Sending Mail");
        }

        return {
          message: "OTP sent to your email",
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
  },
};
