const express = require("express");
const cors = require("cors");
const { authRouter } = require("./routes");
require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/users", authRouter);

app.use((err, req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});




module.exports = app;