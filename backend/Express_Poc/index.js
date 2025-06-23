require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const poc = require("./controllers/pocController");
const expert = require("./controllers/expertController");
const consul = require("./middleware/consul");

const app = express();

app.get('/', (req, res) => {
  res.send('Express Poc running');
});

const PORT = process.env.PORT ;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Called Services

app.use("/poc", poc);
app.use("/expert", expert);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
