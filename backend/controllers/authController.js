const sgMail = require("@sendgrid/mail");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Role, User } = require("../models");
const key = require("../configs/key");

require("dotenv").config();
sgMail.setApiKey(key.sendgrid.api_key);
/**
 * @desc Signup User
 * @route POST /api/auth/signup
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role_id: role,
    });

    res.status(201).json({ msg: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
};

/**
 * @desc Login User
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email }, include: [Role] });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(400).json({ msg: "You have not allowed from admin" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      key.jwt.secret,
      { expiresIn: key.jwt.expiration }
    );

    // Save token in DB - Modified this part
    await User.update({ token: token }, { where: { id: user.id } });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate reset token (valid for 10 minutes)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      key.jwt.secret,
      { expiresIn: 10 * 60 * 1000 }
    );

    // Save reset token and expiry in database
    await user.update({
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    const resetLink = `https://account.amdream.us/reset-password?token=${resetToken}`;
    sgMail.send({
      to: user.email,
      from: key.sendgrid.sender_email,
      subject: "Password Reset Request",
      text: `Click the link below to reset your password: ${resetLink}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <div style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 10 minutes for security reasons.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              If you're having trouble clicking the button, copy and paste this URL into your web browser:<br>
              <a href="${resetLink}" style="color: #4CAF50; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
        </div>
      `,
    });

    res.status(200).json({
      msg: "Password reset instructions sent to your email",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ type: "Server error", msg: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, key.jwt.secret);

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        id: decoded.id,
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token fields
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(500).json({
      msg: "Invalid or expired reset token",
    });
  }
};
