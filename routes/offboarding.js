const express = require("express");
const router = express.Router();
const Offboarding = require("../models/Offboarding");

router.post("/", async (req, res) => {
  const offboarding = new Offboarding(req.body);
  await offboarding.save();
  res.status(201).json(offboarding);
});

router.get("/", async (req, res) => {
  const data = await Offboarding.find().populate("employee");
  res.json(data);
});

module.exports = router;