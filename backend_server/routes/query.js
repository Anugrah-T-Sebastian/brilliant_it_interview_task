const express = require("express");
const router = express.Router();

const { queryResponse } = require("../controllers/query");

router.post("/", queryResponse);
router.get("/", (req, res) => {
  res.send("Query Server is running");
});

module.exports = router;
