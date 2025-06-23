const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("./config/db");
const consul = require("./middleware/consul");

// ✅ Import Controllers
const attendanceRoutes = require("./controllers/attendanceController");
const certificateRoutes = require("./controllers/certificateController");
const resultRoutes = require("./controllers/resultsController");
const individualRoutes = require("./controllers/individualController");
const overallRoutes = require("./controllers/overallController");

// ✅ Initialize Express App
const app = express();
app.get('/', (req, res) => {
  res.send('Express Report running');
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ Register Routes
app.use("/attendance", attendanceRoutes);
app.use("/certificates", certificateRoutes);
app.use("/individual", individualRoutes);
app.use("/results", resultRoutes);
app.use("/overall", overallRoutes);

// ✅ Start Server & Register Service in Consul
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});