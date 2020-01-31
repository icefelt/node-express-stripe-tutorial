const router = require("express").Router()
const User = require("../../models/User")
const bcrypt = require("bcrypt")
const Joi = require("@hapi/joi")

const schema = Joi.object({
    email: Joi.string()
        .trim()
        .email()
        .required()
        .min(6),
    password: Joi.string()
        .trim()
        .required()
        .min(6)
})

router.post("/signup", async (request, response) => {
    const { error } = schema.validate(request.body)
    if (error) {
        response.status(400).json({
            message: error.details[0].message
        })
    } else {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(request.body.password, salt)

        const newUser = new User({
            email: request.body.email,
            password: hashedPassword
        })

        // Required for unique constraint for some reason.
        User.init().then(() => {
            newUser.save((err, product) => {
                if (!err) {
                    response.json({
                        message: `Welcome, ${request.body.email}!`
                    })

                    // TODO: send an email
                } else {
                    console.error(`Could not signup as ${request.body.email}`, err)

                    response.status(400).json({
                        message: `Could not create an account for ${request.body.email}?`
                    })
                }
            })
        })
    }
})

module.exports = router
