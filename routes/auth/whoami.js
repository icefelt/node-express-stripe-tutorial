const router = require("express").Router()
const verifyToken = require("../auth/verifyToken")
const User = require("../../models/User")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

/* Like so. */

/*
 * Point of this file: show what plan a user has, and their limit (metadata).
 * 
 * Works by checking if the user has a stripeId. If not, they have never subscribed.
 * - Otherwise if they do, it checks if they have a plan.
 * - If they have a plan, it returns the plan name and limit
 * - If they don't have a plan it returns "No plan" with a limit of 0
 *
 */

router.get("/whoami", verifyToken, async (request, response) => {
    const query = { email: request.email }

    const user = await User.findOne(query)

    /* Payment stuff */
    let plan = "No plan"
    let limit = 0

    if (user.stripeId) {
        const customer = await stripe.customers.retrieve(user.stripeId)

        if (customer) {
            if (customer.subscriptions.data.length) {
                plan = customer.subscriptions.data[0].plan.nickname
                limit = Number(customer.subscriptions.data[0].plan.metadata.limit)
            }
        }
    }

    response.json({
        message: `You are logged in as ${user.email}`,
        plan,
        limit
    })
})

module.exports = router
