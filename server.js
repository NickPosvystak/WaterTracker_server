const mongoose = require("mongoose");
const app = require("./app");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "./env/development.env"),
});

const { MONGO_URL, PORT } = process.env;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`==> Database connection successful ✅`);

    app.listen(PORT || 3000, () => {
      console.log(`Server running. Use our API on port ==> ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });
