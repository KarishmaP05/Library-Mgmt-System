var mysql = require('mysql'); // mysql library included
const express = require("express"); // require function import express module in nodejs application
const app = express(); //used to create an instance of an Express application. 
require('dotenv').config();
const bodyParser = require('body-parser'); // is a middleware for Node.js that is used to parse the incoming request
app.use(bodyParser.json()); // used in Express applications to handle form submissions and JSON payloads.



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