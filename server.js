// server.js
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  const { email, amount, vehicleName, image } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: vehicleName, images: [image] },
            unit_amount: parseInt(amount),
          },
          quantity: 1,
        },
      ],
      success_url: `myapp://payment-success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
      cancel_url: "myapp://payment-cancel",
      expand: ["payment_intent"],
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port 5000")
);
