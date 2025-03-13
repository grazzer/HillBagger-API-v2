const express = require("express");
const hills = require("./routes/hills");

const app = express();

app.locals.paginationVolume = 20;

app.use(hills);

module.exports = app;
