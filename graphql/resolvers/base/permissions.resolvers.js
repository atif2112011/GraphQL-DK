const Permissions = require("../../../schema/base/permissions");
const User = require("../../../schema/base/users");
const Roles = require("../../../schema/base/roles");
module.exports = {
  Query: {
    getAllPermissions: async (parent, args, context) => {
      try {
        const permissions = await Permissions.find();
        if (permissions.length === 0) {
          return {
            success: false,
            message: "No permissions found",
          };
        }
        console.log(permissions);
        return {
          permissions: permissions,
          message: "Permission Fetched Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    getPaginatedPermissions: async (_, { page }, context) => {
      const perPage = 10; // Number of documents per page
      const currentPage = page || 1; // Current page, default is 1

      try {
        const totalPermissions = await Permissions.countDocuments();
        const totalPages = Math.ceil(totalPermissions / perPage);

        if (currentPage > totalPages) {
          return {
            success: false,
            message: "Invalid page number",
          };
        }

        const permissions = await Permissions.find()
          .skip(perPage * (currentPage - 1))
          .limit(perPage);

        return {
          currentPage,
          totalPages,
          totalCount: totalPermissions,
          permissions: permissions,
          message: "Permission Fetched Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
    getPermissionById: async (_, { id }, context) => {
      try {
        const permission = await Permissions.findById(id);

        if (!permission)
          return {
            success: false,
            message: "Permission Not found",
          };
        return {
          permission: permission,
          message: "Permission Fetched Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    addPermission: async (_, { userId, roleId }, context) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return { success: false, message: "userId is invalid" };
        }
        const role = await Roles.find({ id: roleId });
        if (role.length === 0) {
          return {
            success: false,
            message: "roleId is invalid",
          };
        }
        const permission = await Permissions.create({
          userId,
          roleId,
        });
        return {
          permission: permission,
          message: "Permission Added Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    updatePermission: async (_, { permissionId, input }, context) => {
      try {
        // console.log(`Permission Id`, permissionId);
        // console.log(`New Permission`, input);
        const { userId, roleId } = input;
        // Verify if userId exists
        const user = await User.findById(userId);
        if (!user) {
          return {
            success: false,
            message: "User with the provided ID does not exist",
          };
        }

        // Verify if roleId exists
        const role = await Roles.findOne({ id: roleId });
        if (!role) {
          return {
            success: false,
            message: "Role with the provided ID does not exist",
          };
        }

        // Update the permission
        const updatedPermission = { userId, roleId }; // Construct updatedPermission
        const permission = await Permissions.findByIdAndUpdate(
          permissionId,
          updatedPermission,
          { new: true }
        );

        if (!permission) {
          return {
            success: false,
            message: "Permission not found",
          };
        }

        return {
          permission: permission,
          message: "Permission Updated Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    deletePermission: async (_, { permissionId }, context) => {
      try {
        // Delete the permission
        const deletedPermission = await Permissions.findByIdAndDelete(
          permissionId
        );
        if (!deletedPermission) {
          return {
            sucess: false,
            message: "Permission not found",
          };
        }

        return {
          message: "Permission Deleted Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
  },
};
