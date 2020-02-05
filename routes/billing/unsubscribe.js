const router = require("express").Router()
const verifyToken = require("../auth/verifyToken")
const User = require("../../models/User")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

/*
 * Point of this file: unsubscribe a user from their plan.
 * 
 * Assumes that our SaaS only allows one subscription at a time, it unsubs from
 * the first subscription by looking up the user's stripeId.  
 *
 */

router.post("/unsubscribe", verifyToken, async (request, response) => {
    const query = { email: request.email }

    const user = await User.findOne(query)

    // Case 1: User has subscribed before.
    if (user.stripeId) {
        const customer = await stripe.customers.retrieve(user.stripeId)

        if (customer) {
            // Assuming no duplicate subscriptions, we only need to remove the first subscription
            if (customer.subscriptions.data.length) {
                stripe.subscriptions.del(customer.subscriptions.data[0].id, (error, confirmation) => {
                    if (confirmation) {
                        response.json({
                            message: `Confirmed unsubscription for ${request.email}.`
                        })
                    } else {
                        response.status(400).json({
                            message: `${request.email} could not be unsubscribed? (No confirmation)`
                        })
                    }
                })
            } else {
                // Otherwise, the user is not subscribed.
                response.status(400).json({
                    message: `${request.email} has no active subscriptions?`
                })
            }
        } else {
            response.status(400).json({
                message: `Could not unsubscribe ${request.email}; Please contact support.`
            })
        }
    } else {
        // Case 2: user has never subscribed before.
        response.status(400).json({
            message: `${request.email} has never subscribed before?`
        })
    }
})

module.exports = router
