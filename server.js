const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "./env/development.env"),
});

const app = require("./app");

const { MONGO_URL, PORT} = process.env;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Database connection successful ✅");
    app.listen(PORT, () => {
      console.log(`==> Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
  



