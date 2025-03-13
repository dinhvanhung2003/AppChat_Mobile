const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Gửi OTP
exports.sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    // Kiểm tra nếu số điện thoại đã đăng ký
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) return res.status(400).json({ message: "Số điện thoại đã tồn tại" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã OTP

    // Gửi OTP qua SMS (Twilio)
    await client.messages.create({
      body: `Mã xác nhận của bạn là: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phoneNumber
    });

    return res.status(200).json({ otp, message: "OTP đã gửi" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};
