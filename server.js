const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

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

    // Ensure amount is a number
    const unitAmount = parseInt(amount);
    if (isNaN(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount value",
      });
    }

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
            unit_amount: unitAmount, // amount in cents
          },
          quantity: 1,
        },
      ],
      success_url: "myapp://payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "myapp://payment-cancel",
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({
      success: false,
      message: error.raw?.message || "Checkout session creation failed",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
