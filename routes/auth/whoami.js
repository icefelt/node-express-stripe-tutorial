const router = require("express").Router()
const Joi = require("@hapi/joi")
const verifyToken = require("../auth/verifyToken")
const User = require("../../models/User")

/* Like so. */

router.get("/whoami", verifyToken, async (request, response) => {
    const query = { email: request.email }

    const user = await User.findOne(query)

    response.json({
        message: `You are logged in as ${user.email}`
    })
})

module.exports = router
