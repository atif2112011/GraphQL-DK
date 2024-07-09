const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
},{ timestamps: true}

);

roleSchema.index({ id: 1 }, { unique: true });
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ id: 1,name:1 }, { unique: true });
roleSchema.index({ id: 1,name:1,description:1 }, { unique: true });

const Roles = mongoose.model('Roles', roleSchema);

module.exports = Roles;
