const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Gig = require("../models/Gig");

// @desc    Create a bid
// @route   POST /api/bids
// @access  Private
exports.createBid = async (req, res, next) => {
  try {
    const { gigId, message, price } = req.body;

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    if (gig.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This gig is no longer accepting bids",
      });
    }

    // Prevent owner from bidding on their own gig
    if (gig.ownerId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot bid on your own gig",
      });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user.id,
      message,
      price,
    });

    const populatedBid = await Bid.findById(bid._id).populate(
      "freelancerId",
      "name email"
    );

    res.status(201).json({
      success: true,
      data: populatedBid,
    });
  } catch (error) {
    // Handle duplicate bid error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already placed a bid on this gig",
      });
    }
    next(error);
  }
};

// @desc    Get bids for a gig
// @route   GET /api/bids/gig/:gigId
// @access  Public
exports.getBidsByGig = async (req, res, next) => {
  try {
    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bids by freelancer
// @route   GET /api/bids/my/bids
// @access  Private
exports.getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user.id })
      .populate("gigId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hire a freelancer (Atomic Transaction)
// @route   POST /api/bids/:bidId/hire
// @access  Private
exports.hireBid = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bidId = req.params.bidId;

    // Find the bid with session
    const bid = await Bid.findById(bidId).populate("gigId").session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    const gig = bid.gigId;

    // Authorization: Only gig owner can hire
    if (gig.ownerId.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        success: false,
        message: "Not authorized to hire for this gig",
      });
    }

    // Race condition check: Ensure gig is still open
    if (gig.status !== "open") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "This gig has already been assigned",
      });
    }

    // ATOMIC OPERATIONS:
    // 1. Update the selected bid to 'hired'
    bid.status = "hired";
    await bid.save({ session });

    // 2. Update the gig status to 'assigned'
    gig.status = "assigned";
    await gig.save({ session });

    // 3. Reject all other bids for this gig
    await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bidId },
        status: "pending",
      },
      { status: "rejected" },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Populate the hired bid for response
    const hiredBid = await Bid.findById(bidId).populate(
      "freelancerId",
      "name email"
    );

    // Emit socket event for real-time notification
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    const freelancerSocketId = userSockets.get(bid.freelancerId.toString());

    if (freelancerSocketId) {
      io.to(freelancerSocketId).emit("hired", {
        message: `You have been hired for "${gig.title}"!`,
        gigId: gig._id,
        gigTitle: gig.title,
        bidId: bid._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Freelancer hired successfully",
      data: hiredBid,
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
