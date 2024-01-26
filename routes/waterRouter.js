const express = require("express");
const { setWaterRate } = require("../controllers/waterController");
const { validateFields } = require("../middlewares");
const { schemas } = require("../models/waterModel");
const router = express.Router();

//TODO waterRate, update, delete, perDay, perMonth ❓

router.post("/", validateFields(schemas.waterJoiValidation), setWaterRate);

module.exports = router;
