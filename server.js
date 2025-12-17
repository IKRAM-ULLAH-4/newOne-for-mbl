// server.js
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Create Checkout Session endpoint
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { email, amount, vehicleName, image } = req.body;

    // Validate required fields
    if (!email || !amount || !vehicleName || !image) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, amount, vehicleName, or image",
      });
    }

    // Convert amount to integer cents
    const unitAmount = parseInt(amount);
    if (isNaN(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount value",
      });
    }

    // Create Checkout Session with expanded payment_intent
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: vehicleName,
              images: [image],
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: "myapp://payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "myapp://payment-cancel",
      expand: ["payment_intent"], // <--- important
    });

    // Return full details
    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
      paymentIntent: session.payment_intent ? {
        id: session.payment_intent.id,
        amount: session.payment_intent.amount,
        currency: session.payment_intent.currency,
        status: session.payment_intent.status,
      } : null,
    });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({
      success: false,
      message: error.raw?.message || "Checkout session creation failed",
    });
  }
});

// Optional: test route
app.get("/", (req, res) => {
  res.send("Stripe Checkout Server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
