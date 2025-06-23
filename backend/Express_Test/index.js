require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const MCQ = require("./controllers/mcqController");
const Test = require("./controllers/testController");
const TestCase = require("./controllers/testcaseController");
const Coding = require("./controllers/codeController");
const consul = require("./middleware/consul");

const app = express();

app.get('/', (req, res) => {
    res.send('Express Test running');
});


const port = process.env.PORT;

//  Middleware
app.use(cors());
app.use(bodyParser.json());


// API Routes
app.use("/mcq", MCQ);
app.use("/test", Test);
app.use("/testcase", TestCase);
app.use("/coding", Coding);


// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
