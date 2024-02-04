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
  ctrl.setWaterData
);
router.put("/:id", authentificate, isValidId, ctrl.updateById);
router.delete(
  "/:id",
  authentificate,
  // validateBody(schemas.waterJoiValidation),
  isValidId,
  ctrl.deleteById
);

router.get("/today", authentificate, ctrl.getWaterToday);
// router.get("/month", authentificate, ctrl.getWaterInfoByMonth);½
router.get("/month", authentificate, ctrl.getWaterPerMonth);

module.exports = router;
