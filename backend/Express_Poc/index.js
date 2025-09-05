require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const poc = require("./controllers/pocController");
const expert = require("./controllers/expertController");
const authenticateJWT = require("./middleware/auth");

const app = express();

// Root route (no JWT required)
app.get('/', (req, res) => {
  res.send('Express Poc running');
});

// Health check route (no JWT required)
app.get('/health', (req, res) => {
  res.json({ status: 'Express Poc is healthy' });
});

const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/poc", authenticateJWT, poc);
app.use("/expert", authenticateJWT, expert);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});