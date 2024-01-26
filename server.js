import mongoose from "mongoose";

import app from "./app.js";

const {MONGO_URL, PORT = 3000} = process.env;

mongoose.connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    })
  })
  .catch(error => {
    console.log(error.message);
    process.exit(1);
  })