const express = require("express");
const {
  createBid,
  getBidsByGig,
  getMyBids,
  hireBid,
} = require("../controllers/bidController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createBid);
router.get("/gig/:gigId", getBidsByGig);
router.get("/my/bids", protect, getMyBids);
router.post("/:bidId/hire", protect, hireBid);

module.exports = router;
