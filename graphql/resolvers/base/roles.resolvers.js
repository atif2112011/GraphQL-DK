const Permissions = require("../../../schema/base/permissions");
const User = require("../../../schema/base/users");
const Roles = require("../../../schema/base/roles");

module.exports = {
  Query: {
    getAllRoles: async (parent, args, context) => {
      try {
        const roles = await Roles.find();
        if (roles.length === 0) {
          return {
            success: false,
            message: "No roles found",
          };
        }

        return {
          roles: roles,
          message: "Roles Fetched Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    getPaginatedRoles: async (_, { page }, context) => {
      const perPage = 10; // Number of documents per page
      const currentPage = page || 1; // Current page, default is 1

      try {
        const totalRoles = await Roles.countDocuments();
        const totalPages = Math.ceil(totalRoles / perPage);

        if (currentPage > totalPages) {
          return {
            success: false,
            message: "Invalid page number",
          };
        }

        const roles = await Roles.find()
          .sort({ id: 1 })
          .skip(perPage * (currentPage - 1))
          .limit(perPage);

        return {
          currentPage,
          totalPages,
          totalCount: totalRoles,
          roles: roles,
          message: "Roles Fetched Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
    getRoleById: async (_, { id }, context) => {
      try {
        const role = await Roles.findOne({ id: id });
        console.log(role);
        if (!role)
          return {
            success: false,
            message: "Role Not found",
          };
        return {
          role: role,
          message: "Role Fetched Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    addRole: async (_, args, context) => {
      try {
        const role = await Roles.create(args);
        if (!role)
          return {
            success: false,
            message: "Error Creating role",
          };

        return {
          role: role,
          message: "Role Added Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    updateRole: async (_, { id, input }, context) => {
      try {
        // console.log(`Role Id`, id);
        // console.log(`New Role`, input);

        // Construct updateRole
        const updatedRole = await Roles.findOneAndUpdate({ id: id }, input, {
          new: true,
        });

        if (!updatedRole) {
          return {
            success: false,
            message: "Role not found",
          };
        }

        return {
          role: updatedRole,
          message: "Role Updated Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },

    deleteRole: async (_, { id }, context) => {
      try {
        // Delete the permission
        const deletedRole = await Roles.deleteOne({ id: id });
        if (!deletedRole) {
          return {
            sucess: false,
            message: "Role not found",
          };
        }

        return {
          message: "Role Deleted Successfully",
          success: true,
        };
      } catch (error) {
        console.log(`Error :`, error.message);
        throw new Error(error.message);
      }
    },
  },
};
