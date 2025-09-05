  require("dotenv").config();
  const express = require("express");
  const cors = require("cors");
  const mongoose = require("./config/db");
  const attendanceRoutes = require("./controllers/attendanceController");
  const certificateRoutes = require("./controllers/certificateController");
  const resultRoutes = require("./controllers/resultsController");
  const individualRoutes = require("./controllers/individualController");
  const overallRoutes = require("./controllers/overallController");
  const authenticateJWT = require("./middleware/auth");

  const app = express();

  app.get('/', (req, res) => {
    res.send('Express Report running');
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'Express Report is healthy' });
  });

  const PORT = process.env.PORT || 3003;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use("/attendance", authenticateJWT, attendanceRoutes);
  app.use("/certificates", authenticateJWT, certificateRoutes);
  app.use("/individual", authenticateJWT, individualRoutes);
  app.use("/results", authenticateJWT, resultRoutes);
  app.use("/overall", authenticateJWT, overallRoutes);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });