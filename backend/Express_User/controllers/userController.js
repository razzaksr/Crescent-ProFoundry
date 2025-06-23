require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const consul = require('../middleware/consul');
const axios = require("axios");

const router = express.Router();

// Login User and generate JWT token
router.post('/login', async (req, res) => {
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
        full_name: user.full_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '10h', algorithm: "HS256" }
    );

    // ✅ If admin, skip Consul and return basic info
    if (user.admin === true) {
      return res.status(200).json({
        msg: 'Login successful (admin)',
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          admin: true
        }
      });
    }

    // 🧭 Find the Express_Poc service via Consul
    const serviceName = "Express_Poc";
    const services = await consul.catalog.service.nodes(serviceName);

    if (!services || services.length === 0) {
      return res.status(500).json({ msg: "Express_Poc service not found in Consul" });
    }

    const { ServiceAddress, ServicePort } = services[0];

    if (!ServiceAddress || !ServicePort) {
      return res.status(500).json({ msg: "Invalid service address from Consul" });
    }

    // 🔗 Make request to get mod_poc_id
    const modAndPocUrl = `http://${ServiceAddress}:${ServicePort}/poc/mod_id_poc_id/${user.user_id}`;
    const modAndPocRes = await axios.get(modAndPocUrl);
    const mod_poc_id = modAndPocRes.data;

    // ✅ Return full info for non-admins
    res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        admin: false,
        mod_poc_id
      }
    });

  } catch (error) {
    console.error("Login Error:", error.message);

    if (error.response) {
      console.error("POC Service Response Error:", error.response.data);
    }

    res.status(500).json({
      msg: "Login failed",
      error: error.message,
      poc_error: error.response?.data || null
    });
  }
});

// Generate password for non-admin users if empty
const generatePassword = (full_name, mobile_no) => {
  // First 4 letters of full_name (lowercase)
  let namePart = (full_name || "").toLowerCase().slice(0, 4);
  if (namePart.length < 4) {
    namePart = namePart.padEnd(4, namePart[0] || "a"); // Pad with first letter or 'a'
  }

  // Last 4 digits of mobile_no
  const digits = (mobile_no || "").replace(/\D/g, ""); // Extract digits
  const mobilePart = digits.slice(-4).padStart(4, "0"); // Last 4 digits, pad with zeros if needed

  return namePart + mobilePart;
};

// Single user creation
router.post("/add_user", async (req, res) => {
  const {
    full_name,
    department,
    college,
    rollno,
    email,
    password: rawPassword,
    mobile_no,
    status,
    admin,
  } = req.body;

  // Validate required fields
  if (!full_name || !email) {
    return res.status(400).json({ msg: "Full name and email are required" });
  }

  if (admin) {
    if (!rawPassword) {
      return res.status(400).json({ msg: "Password is required for admin users" });
    }
  } else {
    if (!department || !college || !rollno) {
      return res
        .status(400)
        .json({ msg: "Department, college, and roll number are required for non-admin users" });
    }
    if (!rawPassword && !mobile_no) {
      return res.status(400).json({ msg: "Mobile number is required for non-admin users when password is empty" });
    }
  }

  try {
    // Check for existing user
    const query = [{ email }];
    if (rollno) query.push({ rollno });

    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      return res.status(400).json({ msg: "Email or Roll Number already exists" });
    }

    // Generate or use provided password
    const finalPassword = !rawPassword && !admin ? generatePassword(full_name, mobile_no) : rawPassword;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(finalPassword, salt);

    const newUser = new User({
      full_name,
      email,
      password: hashedPassword,
      mobile_no: mobile_no || null,
      department: department || "",
      college: college || "",
      rollno: rollno || null,
      status: status !== undefined ? status : true,
      admin: admin === true,
    });

    const savedUser = await newUser.save();
    // Return plain password and requested fields in response
    res.status(201).json({
      full_name: savedUser.full_name,
      email: savedUser.email,
      plain_password: finalPassword,
      department: savedUser.department,
      college: savedUser.college,
      rollno: savedUser.rollno,
    });
  } catch (error) {
    console.error("Error in add_user:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// Bulk user creation
router.post("/bulk_add_users", async (req, res) => {
  const users = req.body; // Expect array of user objects

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ msg: "Users array is required and cannot be empty" });
  }

  const results = {
    successes: [],
    failures: [],
  };

  try {
    for (const user of users) {
      const {
        full_name,
        department,
        college,
        rollno,
        email,
        password: rawPassword,
        mobile_no,
        status,
        admin = false, // Default to false
      } = user;

      // Validate required fields
      if (!full_name || !email) {
        results.failures.push({ email: email || "unknown", msg: "Full name and email are required" });
        continue;
      }

      if (admin) {
        if (!rawPassword) {
          results.failures.push({ email: email || "unknown", msg: "Password is required for admin users" });
          continue;
        }
      } else {
        if (!department || !college || !rollno) {
          results.failures.push({
            email: email || "unknown",
            msg: "Department, college, and roll number are required for non-admin users",
          });
          continue;
        }
        if (!rawPassword && !mobile_no) {
          results.failures.push({
            email: email || "unknown",
            msg: "Mobile number is required for non-admin users when password is empty",
          });
          continue;
        }
      }

      // Check for existing user
      const query = [{ email }];
      if (rollno) query.push({ rollno });

      const existingUser = await User.findOne({ $or: query });
      if (existingUser) {
        results.failures.push({ email, msg: "Email or Roll Number already exists" });
        continue;
      }

      // Generate or use provided password
      const finalPassword = !rawPassword && !admin ? generatePassword(full_name, mobile_no) : rawPassword;

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(finalPassword, salt);

      const newUser = new User({
        full_name,
        email,
        password: hashedPassword,
        mobile_no: mobile_no || null,
        department: department || "",
        college: college || "",
        rollno: rollno || null,
        status: status !== undefined ? status : true,
        admin: admin === true,
      });

      const savedUser = await newUser.save();
      // Include requested fields in success response
      results.successes.push({
        full_name: savedUser.full_name,
        email: savedUser.email,
        plain_password: finalPassword,
        department: savedUser.department,
        college: savedUser.college,
        rollno: savedUser.rollno,
      });
    }

    // Return results
    res.status(200).json({
      msg: "Bulk user creation completed",
      successes: results.successes,
      failures: results.failures,
    });
  } catch (error) {
    console.error("Error in bulk_add_users:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// Get all Users
router.get("/read_all_users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Get User by user_id
router.get("/get_user_by_id/:user_id", async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.user_id });

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Update User details by user_id
router.put("/update_user/:user_id", async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;

    // Check if the user exists
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // If password is provided, hash it before updating
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    // Perform the update
    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.params.user_id },
      updateFields,
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Update user_last_login using user_id
router.put("/update_last_login/:user_id", async (req, res) => {
  try {
    const { user_last_login } = req.body;

    if (!user_last_login) {
      return res.status(400).json({ msg: "Last login timestamp is required" });
    }

    // Update the user_last_login field
    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.params.user_id },
      { user_last_login },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Last login updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Delete User by user_id
router.delete("/delete_user/:user_id", async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ user_id: req.params.user_id });

    if (!deletedUser) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// Update User status by user_id
router.put("/update_user_status/:user_id", async (req, res) => {
  const { status } = req.body;

  // Validate that the status is a boolean
  if (typeof status !== "boolean") {
    return res.status(400).json({ msg: "Status must be a boolean value" });
  }

  try {
    // Find the user by user_id
    const user = await User.findOne({ user_id: req.params.user_id });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update the user's status
    user.status = status;
    await user.save();

    res.json({
      msg: `User status updated successfully to ${status ? 'active' : 'inactive'}`,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// GET all user IDs only
router.get("/user-ids", async (req, res) => {
  try {
    const users = await User.find({}, "user_id"); // Select only the 'user_id' field
    const userIds = users.map(user => user.user_id); // Extract just the ID values
    res.status(200).json({ user_ids: userIds });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user IDs", error });
  }
});

// Route to get user_id by rollno
router.get('/get_user_id_by_rollno/:rollno', async (req, res) => {
  try {
      const { rollno } = req.params;
      
      // Find user by rollno
      const user = await User.findOne({ rollno }).select('user_id');
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ user_id: user.user_id });
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Route to get user_ids for multiple rollnos
router.post('/users/bulk', async (req, res) => {
  try {
      const { rollnos } = req.body;

      // Validate input
      if (!Array.isArray(rollnos) || rollnos.length === 0) {
          return res.status(400).json({ message: 'Roll numbers must be provided as a non-empty array' });
      }

      // Find users by rollnos
      const users = await User.find({ rollno: { $in: rollnos } }).select('rollno user_id');

      // Create response mapping rollno to user_id
      const result = rollnos.map(rollno => {
          const user = users.find(u => u.rollno === rollno);
          return {
              rollno,
              user_id: user ? user.user_id : null,

          };
      });

      res.status(200).json(result);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
