const Space = require('../models/Space');
const Testimonial = require('../models/Testimonial');
const { handleImageUpload } = require('../middleware/upload.middleware');

// Fetch public space details for collection form
const getPublicSpace = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const space = await Space.findOne({ slug }).select(
      'name slug brandLogo headerTitle customMessage customPrompts mandatoryAvatarToggle starRatingToggle customQuestions'
    );

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found. Please verify the URL.'
      });
    }

    res.status(200).json({
      success: true,
      space
    });
  } catch (error) {
    next(error);
  }
};

// Public submission of testimonial (no authentication required)
const submitTestimonial = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const space = await Space.findOne({ slug });

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found. Unable to submit review.'
      });
    }

    const { clientName, email, companyRole, starRating, reviewText } = req.body;

    // Validation
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your name.' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!reviewText || reviewText.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a review message (at least 5 characters).'
      });
    }

    // Avatar validation if mandatory
    if (space.mandatoryAvatarToggle && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'An avatar photo is required by this space.'
      });
    }

    // Star rating
    let rating = null;
    if (space.starRatingToggle) {
      const parsedRating = Number(starRating);
      if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a rating between 1 and 5 stars.'
        });
      }
      rating = parsedRating;
    }

    // Process avatar upload
    let avatarUrl = '';
    if (req.file) {
      avatarUrl = await handleImageUpload(req, req.file, 'avatars');
    }

    const testimonial = new Testimonial({
      space: space._id,
      clientName: clientName.trim(),
      email: email.toLowerCase().trim(),
      companyRole: companyRole ? companyRole.trim() : '',
      starRating: rating,
      reviewText: reviewText.trim(),
      avatarUrl,
      status: 'pending' // Moderation default
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your testimonial was submitted successfully.',
      testimonial: {
        id: testimonial._id,
        clientName: testimonial.clientName,
        submittedAt: testimonial.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get approved testimonials for Wall of Love & Embeds
const getPublicWall = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const space = await Space.findOne({ slug }).select(
      'name slug brandLogo headerTitle customMessage starRatingToggle'
    );

    if (!space) {
      return res.status(404).json({
        success: false,
        message: 'Space not found.'
      });
    }

    // Get approved testimonials, featured first, then newest
    const testimonials = await Testimonial.find({
      space: space._id,
      status: 'approved'
    })
      .sort({ isFeatured: -1, submittedAt: -1 })
      .select('clientName companyRole starRating reviewText avatarUrl isFeatured submittedAt');

    res.status(200).json({
      success: true,
      space,
      count: testimonials.length,
      testimonials
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSpace,
  submitTestimonial,
  getPublicWall
};
