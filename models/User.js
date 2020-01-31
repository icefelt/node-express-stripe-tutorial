const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    // Technically unique, but is null by default so don't user the constraint
    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordTokenExpires: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model("User", schema)
