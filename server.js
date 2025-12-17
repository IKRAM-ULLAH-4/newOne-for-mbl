const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Use the secret key from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Elite Motors Booking",
            },
            unit_amount: 5000, // $50
          },
          quantity: 1,
        },
      ],
      success_url: "myapp://payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "myapp://payment-cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({
      success: false,
      message: "Checkout session creation failed",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
