const Gig = require("../models/Gig");

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
exports.getGigs = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      query.status = "open"; // Default to open gigs
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const gigs = await Gig.find(query)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      data: gigs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
exports.getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      "ownerId",
      "name email"
    );

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    res.status(200).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new gig
// @route   POST /api/gigs
// @access  Private
exports.createGig = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.ownerId = req.user.id;

    const gig = await Gig.create(req.body);

    res.status(201).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private
exports.updateGig = async (req, res, next) => {
  try {
    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Make sure user is gig owner
    if (gig.ownerId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this gig",
      });
    }

    gig = await Gig.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private
exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // Make sure user is gig owner
    if (gig.ownerId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this gig",
      });
    }

    await gig.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's gigs
// @route   GET /api/gigs/my/gigs
// @access  Private
exports.getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: gigs.length,
      data: gigs,
    });
  } catch (error) {
    next(error);
  }
};
