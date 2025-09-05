require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const MCQ = require("./controllers/mcqController");
const Test = require("./controllers/testController");
const TestCase = require("./controllers/testcaseController");
const Coding = require("./controllers/codeController");
const authenticateJWT = require("./middleware/auth");

const app = express();

app.get('/', (req, res) => {
  res.send('Express Test running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'Express Test is healthy' });
});

const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/mcq", authenticateJWT, MCQ);
app.use("/test", authenticateJWT, Test);
app.use("/testcase", authenticateJWT, TestCase);
app.use("/coding", authenticateJWT, Coding);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});