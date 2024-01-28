const express = require("express");
const { setWaterRate } = require("../controllers/waterController");
const { validateBody, authentificate,isValidId } = require("../middlewares");
const { schemas } = require("../models/waterModel");
const router = express.Router();

//TODO waterRate, update, delete, perDay, perMonth ❓

router.post("/", validateBody(schemas.waterJoiValidation), setWaterRate);

router.delete("/:id", authentificate, isValidId, ctrl.deleteById);

module.exports = router;
