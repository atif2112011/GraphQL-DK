const mongoose = require("mongoose");
const Session = require("../../schema/auth/sessions");

const getUserRoleAndRoleId = async (sessionId) => {
  const roleQuery = [
    {
      $lookup: {
        as: "user",
        from: "permissions",
        foreignField: "userId",
        localField: "userId",
      },
    },
    {
      $lookup: {
        as: "role",
        from: "roles",
        foreignField: "id",
        localField: "user.roleId",
      },
    },
    {
      $unwind: "$role", // Unwind the 'role' array
    },
    {
      $match: { _id: new mongoose.Types.ObjectId(sessionId) },
    },
    {
      $project: {
        _id: 0,
        role: "$role.name", // Extracting role name from the 'role' array
        roleId: "$role.id",
      },
    },
  ];
  const userRoleAndId = await Session.aggregate(roleQuery);
  return userRoleAndId;
};
module.exports = getUserRoleAndRoleId;
