const express = require("express");
const cors = require("cors");
const { authRouter, waterRouter } = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

require("dotenv").config();

const app = express();

// Check server-----------------
const server = express();
server.use((req, res) => {
  res.send("Hello world!");
});
//------------------------------

app.use(cors());
app.use(express.json());

app.use("/api/users", authRouter);
app.use("/api/water", waterRouter);


app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
