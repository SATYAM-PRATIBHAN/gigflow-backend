const express = require("express");
const {
  getGigs,
  getGig,
  createGig,
  updateGig,
  deleteGig,
  getMyGigs,
} = require("../controllers/gigController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(getGigs).post(protect, createGig);
router.get("/my/gigs", protect, getMyGigs);
router
  .route("/:id")
  .get(getGig)
  .put(protect, updateGig)
  .delete(protect, deleteGig);

module.exports = router;
