import express from "express";
import User from "../models/User.js";
import crypto from "crypto";
import { protect } from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";

const router = express.Router();

/* =========================
   VALIDATION HANDLER
========================= */
const validate = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation error",
      errors: errors.array().map((err) => err.msg),
    });
  }

  return null;
};

/* =========================
   COOKIE OPTIONS (IMPORTANT FIX)
========================= */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

/* =========================
   JWT
========================= */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* =========================
   SEND TOKEN
========================= */
const sendToken = (res, user, statusCode) => {
  const token = generateToken(user._id);

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    id: user._id,
    username: user.username,
    email: user.email,
  });
};

/* =========================
   REGISTER
========================= */
router.post(
  "/register",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validate(req);
    if (errors) return res.status(400).json({ errors });

    const username = req.body.username;
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    sendToken(res, user, 201);
  }),
);

/* =========================
   LOGIN
========================= */
router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validate(req);
    if (errors) return res.status(400).json({ errors });

    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    sendToken(res, user, 200);
  }),
);

/* =========================
   LOGOUT
========================= */
router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);

  res.status(200).json({ message: "Logged out successfully" });
});

/* =========================
   FORGOT PASSWORD
========================= */
router.post(
  "/forgot-password",
  [body("email").trim().isEmail().withMessage("Valid email is required")],
  asyncHandler(async (req, res) => {
    const errors = validate(req);
    if (errors) return res.status(400).json({ errors });

    const email = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <h2>Password Reset</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link expires in 15 minutes.</p>
    `;

    try {
      await sendEmail(user.email, "Password Reset", html);
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ message: "Email sending failed" });
    }

    res.status(200).json({
      message: "If that email exists, a reset link has been sent",
    });
  }),
);

/* =========================
   RESET PASSWORD
========================= */
router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validate(req);
    if (errors) return res.status(400).json({ errors });

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  }),
);

/* =========================
   ME (PROTECTED)
========================= */
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
  }),
);

export default router;
