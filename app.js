var mysql = require('mysql');
const express = require("express");
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const userRoute = require("./routes/userRoute")
const studentRoute = require("./routes/studentRoute")
const bookRoute = require("./routes/bookRoute")
const issueRecordsRoute = require("./routes/issueRecordsRoute")


app.use('/', userRoute)
app.use('/', studentRoute)
app.use('/', bookRoute)
app.use('/', issueRecordsRoute)

// set port, listen for requests
port = process.env.PORT
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});