const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roleId: {
        type: Number,  // Change the type to String
        ref: 'Roles',
        required: true,
        // Manually specify the localField and foreignField for roleId
        localField: 'roleId',
        foreignField: 'id'  // Refers to the 'id' field in the 'Roles' model
    }
});

permissionSchema.index({ userId: 1, roleId: 1 }, { unique: true });
permissionSchema.index({ userId: 1 }, { unique: true });
// Add autopopulate plugin to automatically populate referenced documents

module.exports = mongoose.model('Permissions', permissionSchema);
