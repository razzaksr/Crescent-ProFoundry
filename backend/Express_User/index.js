require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const user = require("./controllers/userController");
const login = require("./controllers/loginController");
const authenticateJWT = require("./middleware/auth");

const app = express();

app.get('/', (req, res) => {
  res.send('Express User running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'Express User is healthy' });
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/login", login); // No JWT for login
app.use("/user", authenticateJWT, user); // Protect user routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});