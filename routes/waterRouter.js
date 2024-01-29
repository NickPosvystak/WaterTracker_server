const express = require("express");
const ctrl = require("../controllers/waterController");
const { validateBody, authentificate, isValidId } = require("../middlewares");
const { schemas } = require("../models/waterModel");
const router = express.Router();

//TODO waterRate, update, delete, perDay, perMonth ❓

router.post(
  "/",
  authentificate,
  validateBody(schemas.waterJoiValidation),
  ctrl.setWaterRate
);

router.delete("/:id", authentificate, isValidId, ctrl.deleteById);

router.get("/today",getWaterToday)

module.exports = router;
