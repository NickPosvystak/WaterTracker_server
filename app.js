import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRouter.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" assert { type: "json" };

import dotenv from "dotenv";

dotenv.config();

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

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;

