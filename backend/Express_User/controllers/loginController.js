require("dotenv").config();
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const consul = require('../middleware/consul');
const axios = require("axios");

const router = express.Router();

// Login User and generate JWT token
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔐 Authenticate user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 🎟️ Create JWT
    const token = jwt.sign(
      {
        userId: user.user_id,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '10h', algorithm: 'HS256' }
    );

    // ✅ If admin, skip Consul and return basic info
    if (user.admin === true) {
      return res.status(200).json({
        msg: 'Login successful (admin)',
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          admin: true,
        },
      });
    }

    // 🧭 Find the Express_Poc service via Consul
    const serviceName = 'Express_Poc';
    const services = await consul.catalog.service.nodes(serviceName);

    if (!services || services.length === 0) {
      return res.status(500).json({ msg: 'Express_Poc service not found in Consul' });
    }

    const { ServiceAddress, ServicePort } = services[0];

    if (!ServiceAddress || !ServicePort) {
      return res.status(500).json({ msg: 'Invalid service address from Consul' });
    }

    // 🔗 Make request to get mod_poc_id with JWT token
    const modAndPocUrl = `http://${ServiceAddress}:${ServicePort}/poc/mod_id_poc_id/${user.user_id}`;
    const modAndPocRes = await axios.get(modAndPocUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const mod_poc_id = modAndPocRes.data;

    // ✅ Return full info for non-admins
    res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        admin: false,
        mod_poc_id,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);

    if (error.response) {
      console.error('POC Service Response Error:', error.response.data);
    }

    res.status(500).json({
      msg: 'Login failed',
      error: error.message,
      poc_error: error.response?.data || null,
    });
  }
});

module.exports = router;
