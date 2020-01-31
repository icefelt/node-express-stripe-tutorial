const router = require("express").Router()
const User = require("../../models/User")
const bcrypt = require("bcrypt")
const Joi = require("@hapi/joi")
const jsonwebtoken = require("jsonwebtoken")

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

router.post("/login", async (request, response) => {
    const { error } = schema.validate(request.body)
    if (error) {
        response.status(400).json({
            message: error.details[0].message
        })
    } else {
        const query = { email: request.body.email }

        const user = await User.findOne(query)

        if (user) {
            const passwordWasCorrect = await bcrypt.compare(request.body.password, user.password)

            if (passwordWasCorrect) {
                // Create a token with just the email address.
                const token = jsonwebtoken.sign(user.email, process.env.TOKEN_SECRET)

                response.json({
                    message: `Signed in as ${request.body.email}.`,
                    token
                })

                // TODO: send an email
            } else {
                response.status(400).json({
                    message: `Wrong email or password.`
                })
            }
        } else {
            response.status(400).json({
                message: `Wrong email or password.`
            })
        }
    }
})

module.exports = router
