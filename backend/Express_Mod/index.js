require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const modules = require("./controllers/moduleController");
const organization = require("./controllers/organizationController");
const authenticateJWT = require("./middleware/auth");
const consul = require("./middleware/consul");


const app = express();

app.get('/', (req, res) => {
  res.send('Express Mod running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'Express Mod is healthy' });
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/modules", authenticateJWT, modules);
app.use("/organization", authenticateJWT, organization);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});