const express = require("express");
const { authControllers } = require("../controllers");

const router = express.Router();

router.post("/register", authControllers.createUser)


module.exports = router;
