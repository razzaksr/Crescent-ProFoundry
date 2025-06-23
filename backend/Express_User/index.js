require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const user = require("./controllers/userController");
const consul = require("./middleware/consul");

const app = express();
app.get('/', (req, res) => {
  res.send('Express User running');
});


const PORT = process.env.PORT ;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Called Services

app.use("/user", user);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
