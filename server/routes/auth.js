const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Start Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ Google OAuth callback HIT");
    console.log("🟢 req.user:", req.user);

    if (!req.user) {
      console.error("❌ req.user is undefined – Passport did not authenticate the user!");
      return res.redirect("/");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Token generated:", token);

    // Build frontend redirect URL
    const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
    const redirectURL = `${clientURL}/dashboard?token=${token}`;
    console.log("🔁 Redirecting to:", redirectURL);

    // Send user to frontend with token in URL
    res.redirect(redirectURL);
  }
);

module.exports = router;
