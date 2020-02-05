const router = require("express").Router()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

/*
 * Point of this file: list available plans via Stripe.
 * 
 * You can hardcode "product" or declare it as an environment variable. 
 *
 */

router.get("/plans", async (request, response) => {
    let plans = await stripe.plans.list({
        "product": "prod_GgHrvGjnu7Fo9M",
        "interval": "month",
        "currency": "usd"
    })

    response.json(plans)
})

module.exports = router
