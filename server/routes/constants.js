import express from "express";
import * as constants from "../models/constants.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(constants);
});

export default router;
