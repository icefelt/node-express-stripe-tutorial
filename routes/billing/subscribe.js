const router = require("express").Router()
const Joi = require("@hapi/joi")
const verifyToken = require("../auth/verifyToken")
const User = require("../../models/User")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

/*
 * Point of this file: subscribe the user to a payment plan.
 * 
 * The user may only have *ONE* payment plan. So if they already have one, refuse.
 * 
 * If the user is subscribing for the first time, create a stripeId for them. Otherwise,
 * create a new subscription using their existing stripeId. 
 *
 */

const schema = Joi.object({
    plan_id: Joi.string()
        .required(),
    payment_method: Joi.string()
        .required()
})

router.post("/subscribe", verifyToken, async (request, response) => {
    const { error } = schema.validate(request.body)
    if (error) {
        response.status(400).json({
            message: error.details[0].message
        })
    } else {
        const query = { email: request.email }

        const user = await User.findOne(query)

        // Case 1: User has subscribed before.
        if (user.stripeId) {
            const customer = await stripe.customers.retrieve(user.stripeId)

            if (customer) {
                // A user may only have ONE subscription
                if (customer.subscriptions.data.length) {
                    response.status(400).json({
                        message: `${request.email} is already subscribed; Try unsubscribing to change plans.`
                    })
                } else {
                    // Subscribe the user; they don't have an active subscription
                    const subscription = await stripe.subscriptions.create({
                        customer: customer.id,
                        items: [{
                            plan: request.body.plan_id
                        }],
                        expand: ["latest_invoice.payment_intent"]
                    })

                    response.json({
                        message: `Thank you ${request.email} for your new subscription!`
                    })
                }
            } else {
                response.status(400).json({
                    message: `Could create a subscription for ${request.email}; Please contact support.`
                })
            }
        } else {
            // Case 2: first time ever subscribing.
            const customer = await stripe.customers.create({
                payment_method: request.body.payment_method,
                email: request.email,
                invoice_settings: {
                    default_payment_method: request.body.payment_method
                }
            })

            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{
                    plan: request.body.plan_id
                }],
                expand: ["latest_invoice.payment_intent"]
            })

            user.stripeId = customer.id
            await user.save()

            response.json({
                message: `Thank you ${request.email} for your first subscription!`
            })
        }
    }
})

module.exports = router
