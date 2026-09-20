const Testimonial = require('../models/Testimonial');
const Space = require('../models/Space');

// Helper to check space ownership
const verifySpaceOwnership = async (spaceId, userId) => {
  const space = await Space.findOne({ _id: spaceId, owner: userId });
  return Boolean(space);
};

// Get testimonials for a space with moderation filters (status, search, rating)
const getSpaceTestimonials = async (req, res, next) => {
  try {
    const { spaceId } = req.params;
    const isOwner = await verifySpaceOwnership(spaceId, req.user._id);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to space reviews.' });
    }

    const { status, search, rating } = req.query;
    const query = { space: spaceId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      query.starRating = Number(rating);
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { clientName: regex },
        { email: regex },
        { companyRole: regex },
        { reviewText: regex }
      ];
    }

    const testimonials = await Testimonial.find(query).sort({ submittedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials
    });
  } catch (error) {
    next(error);
  }
};

// Update testimonial status (pending, approved, rejected, archived)
const updateTestimonialStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const testimonial = await Testimonial.findById(id).populate('space');
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    if (!testimonial.space.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to moderate this review.' });
    }

    testimonial.status = status;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: `Review status updated to ${status}.`,
      testimonial
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Featured flag
const toggleFeature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id).populate('space');
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    if (!testimonial.space.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this review.' });
    }

    testimonial.isFeatured = !testimonial.isFeatured;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: testimonial.isFeatured ? 'Review marked as featured.' : 'Review unmarked as featured.',
      isFeatured: testimonial.isFeatured,
      testimonial
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Liked flag
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id).populate('space');
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    if (!testimonial.space.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this review.' });
    }

    testimonial.isLiked = !testimonial.isLiked;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: testimonial.isLiked ? 'Review marked as liked.' : 'Review unmarked as liked.',
      isLiked: testimonial.isLiked,
      testimonial
    });
  } catch (error) {
    next(error);
  }
};

// Delete testimonial
const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id).populate('space');
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    if (!testimonial.space.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this review.' });
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSpaceTestimonials,
  updateTestimonialStatus,
  toggleFeature,
  toggleLike,
  deleteTestimonial
};
