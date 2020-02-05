const router = require("express").Router()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Joi = require("@hapi/joi")

/*
 * Point of this file: create a one-time-use payment method from a user's
 * credit card so that you can charge for a subscription.
 * 
 * If you'd like, you could store their CC info and call this
 * method every time they pay with the stored information. 
 *
 */

const schema = Joi.object({
    number: Joi.string()
        .trim()
        .creditCard()
        .required(),
    exp_month: Joi.string()
        .trim()
        .length(2)
        .required(),
    exp_year: Joi.string()
        .trim()
        .length(2)
        .required(),
    cvc: Joi.string()
        .trim()
        .required()
})

router.post("/check_card", async (request, response) => {
    const { error } = schema.validate(request.body)
    if (error) {
        response.status(400).json({
            message: error.details[0].message
        })
    } else {
        stripe.paymentMethods.create({
            type: "card",
            card: {
                number: request.body.number,
                exp_month: request.body.exp_month,
                exp_year: request.body.exp_year,
                cvc: request.body.cvc
            }
        }, (paymentError, paymentMethod) => {
            if (!paymentError) {
                // The credit card is valid
                response.json({
                    message: `Card "${paymentMethod.card.brand}" is OK with Stripe!`,
                    payment_method: paymentMethod.id
                })
            } else {
                // The credit card has an issue
                response.status(400).json({
                    message: `Could not verify card ${request.body.number.substring(0, 6)}... with Stripe?`
                })
            }
        })
    }
})

module.exports = router
