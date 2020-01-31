const router = require("express").Router()
const User = require("../../models/User")
const bcrypt = require("bcrypt")
const Joi = require("@hapi/joi")
const verifyToken = require("../auth/verifyToken")
const crypto = require("crypto")

const changePasswordSchema = Joi.object({
    password: Joi.string()
        .trim()
        .required()
        .min(6)
})

router.post("/change_password", verifyToken, async (request, response) => {
    const { error } = changePasswordSchema.validate(request.body)
    if (error) {
        response.status(400).json({
            message: error.details[0].message
        })
    } else {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(request.body.password, salt)

        const query = { email: request.email }

        User.findOneAndUpdate(query, {
            password: hashedPassword
        }, (err, doc) => {
            if (!err) {
                response.json({
                    message: `Password changed for ${request.email}.`
                })

                // TODO: send an email
            } else {
                response.status(400).json({
                    message: `Could not change password for ${request.email}?`
                })
            }
        })
    }
})

const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .trim()
        .email()
        .required()
        .min(6)
})

router.post("/forgot_password", async (request, response) => {
    const { error } = forgotPasswordSchema.validate(request.body)
    if (error) {
        response.status(400).json({
            message: error.details[0].message
        })
    } else {
        // Create a secure token; 20 chars, expires in 6 hours.
        const token = crypto.randomBytes(20).toString("hex")
        const expiration = Date.now() + 21600000

        console.log(`New reset token for ${request.body.email}: ${token}`)

        const query = { email: request.body.email }

        await User.findOneAndUpdate(query, {
            resetPasswordToken: token,
            resetPasswordTokenExpires: expiration
        }, (err, doc) => {
            if (!err) {
                response.json({
                    message: `Sending a password reset email to ${request.body.email}.`
                })

                // TODO: send an email
            } else {
                response.status(404).json({
                    message: `Could not find ${request.body.email}?`
                })
            }
        })
    }
})

const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required(),
    password: Joi.string()
        .trim()
        .required()
        .min(6)
})

router.post("/reset_password", async (request, response) => {
    const { error } = resetPasswordSchema.validate(request.body)
    if (error) {
        response.status(400).json({
            message: error.details[0].message
        })
    } else {
        // Remember to hash the password!
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(request.body.password, salt)

        const query = {
            resetPasswordToken: request.body.token,
            resetPasswordTokenExpires: {
                $gt: Date.now()
            }
        }

        await User.findOneAndUpdate(query, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordTokenExpires: Date.now()
        }, (err, doc) => {
            if (!err && doc) {
                response.json({
                    message: `Password successfully reset for ${doc.email}.`
                })

                // TODO: send an email
            } else {
                response.status(400).json({
                    message: `This reset link is either invalid or expired; try again.`
                })
            }
        })
    }
})

module.exports = router
