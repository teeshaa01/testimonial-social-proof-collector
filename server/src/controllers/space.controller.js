const Space = require('../models/Space');
const Testimonial = require('../models/Testimonial');
const { slugify } = require('../utils/slugify.util');
const { handleImageUpload } = require('../middleware/upload.middleware');

// Create a new space
const createSpace = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      headerTitle,
      customMessage,
      customPrompts,
      mandatoryAvatarToggle,
      starRatingToggle,
      customQuestions
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Space name is required.' });
    }

    const spaceSlug = slugify(slug || name);
    if (!spaceSlug) {
      return res.status(400).json({ success: false, message: 'Invalid slug generated.' });
    }

    const existingSpace = await Space.findOne({ slug: spaceSlug });
    if (existingSpace) {
      return res.status(400).json({
        success: false,
        message: `Space URL '/collect/${spaceSlug}' is already taken. Please choose another name or slug.`
      });
    }

    let brandLogo = '';
    if (req.file) {
      brandLogo = await handleImageUpload(req, req.file, 'logos');
    }

    // Parse customPrompts and customQuestions if sent as JSON string in multipart
    let parsedPrompts = customPrompts;
    if (typeof customPrompts === 'string') {
      try {
        parsedPrompts = JSON.parse(customPrompts);
      } catch (e) {
        parsedPrompts = customPrompts.split('\n').filter(Boolean);
      }
    }

    let parsedQuestions = customQuestions;
    if (typeof customQuestions === 'string') {
      try {
        parsedQuestions = JSON.parse(customQuestions);
      } catch (e) {
        parsedQuestions = [];
      }
    }

    const space = new Space({
      owner: req.user._id,
      name,
      slug: spaceSlug,
      brandLogo,
      headerTitle: headerTitle || 'Share your experience with us',
      customMessage: customMessage || 'Your feedback helps us continuously improve.',
      customPrompts: parsedPrompts,
      mandatoryAvatarToggle: mandatoryAvatarToggle === true || mandatoryAvatarToggle === 'true',
      starRatingToggle: starRatingToggle !== false && starRatingToggle !== 'false',
      customQuestions: parsedQuestions || []
    });

    await space.save();

    res.status(201).json({
      success: true,
      message: 'Space created successfully.',
      space
    });
  } catch (error) {
    next(error);
  }
};

// Get all spaces for current owner
const getOwnerSpaces = async (req, res, next) => {
  try {
    const spaces = await Space.find({ owner: req.user._id }).sort({ createdAt: -1 });

    // Attach review counts to each space
    const spacesWithStats = await Promise.all(
      spaces.map(async (space) => {
        const totalReviews = await Testimonial.countDocuments({ space: space._id });
        const pendingReviews = await Testimonial.countDocuments({
          space: space._id,
          status: 'pending'
        });
        const approvedReviews = await Testimonial.countDocuments({
          space: space._id,
          status: 'approved'
        });

        return {
          ...space.toObject(),
          stats: {
            totalReviews,
            pendingReviews,
            approvedReviews
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      spaces: spacesWithStats
    });
  } catch (error) {
    next(error);
  }
};

// Get single space by ID
const getSpaceById = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.id, owner: req.user._id });
    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      space
    });
  } catch (error) {
    next(error);
  }
};

// Update space
const updateSpace = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.id, owner: req.user._id });
    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found or unauthorized.' });
    }

    const {
      name,
      slug,
      headerTitle,
      customMessage,
      customPrompts,
      mandatoryAvatarToggle,
      starRatingToggle,
      customQuestions
    } = req.body;

    if (name) space.name = name;

    if (slug) {
      const cleanSlug = slugify(slug);
      if (cleanSlug !== space.slug) {
        const slugExists = await Space.findOne({ slug: cleanSlug, _id: { $ne: space._id } });
        if (slugExists) {
          return res.status(400).json({ success: false, message: 'This slug is already taken.' });
        }
        space.slug = cleanSlug;
      }
    }

    if (headerTitle !== undefined) space.headerTitle = headerTitle;
    if (customMessage !== undefined) space.customMessage = customMessage;

    if (customPrompts !== undefined) {
      let parsedPrompts = customPrompts;
      if (typeof customPrompts === 'string') {
        try {
          parsedPrompts = JSON.parse(customPrompts);
        } catch (e) {
          parsedPrompts = customPrompts.split('\n').filter(Boolean);
        }
      }
      space.customPrompts = parsedPrompts;
    }

    if (mandatoryAvatarToggle !== undefined) {
      space.mandatoryAvatarToggle = mandatoryAvatarToggle === true || mandatoryAvatarToggle === 'true';
    }

    if (starRatingToggle !== undefined) {
      space.starRatingToggle = starRatingToggle === true || starRatingToggle === 'true';
    }

    if (customQuestions !== undefined) {
      let parsedQuestions = customQuestions;
      if (typeof customQuestions === 'string') {
        try {
          parsedQuestions = JSON.parse(customQuestions);
        } catch (e) {
          parsedQuestions = [];
        }
      }
      space.customQuestions = parsedQuestions;
    }

    if (req.file) {
      const newLogo = await handleImageUpload(req, req.file, 'logos');
      if (newLogo) space.brandLogo = newLogo;
    }

    await space.save();

    res.status(200).json({
      success: true,
      message: 'Space updated successfully.',
      space
    });
  } catch (error) {
    next(error);
  }
};

// Delete space and its reviews
const deleteSpace = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.id, owner: req.user._id });
    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found or unauthorized.' });
    }

    // Delete all testimonials inside this space
    await Testimonial.deleteMany({ space: space._id });
    await space.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Space and all associated testimonials have been deleted.'
    });
  } catch (error) {
    next(error);
  }
};

// Get Rating Metrics for a space
const getSpaceMetrics = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.id, owner: req.user._id });
    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found or unauthorized.' });
    }

    const testimonials = await Testimonial.find({ space: space._id });
    const totalReviews = testimonials.length;

    let averageRating = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const statusCounts = { pending: 0, approved: 0, rejected: 0, archived: 0 };

    if (totalReviews > 0) {
      let sum = 0;
      let ratedCount = 0;
      testimonials.forEach((t) => {
        if (space.starRatingToggle && t.starRating) {
          sum += t.starRating;
          ratedCount++;
          const rating = Math.min(Math.max(Math.round(t.starRating), 1), 5);
          distribution[rating] = (distribution[rating] || 0) + 1;
        }
        statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      });
      averageRating = ratedCount > 0 ? Number((sum / ratedCount).toFixed(1)) : 0;
    }

    const breakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = distribution[stars] || 0;
      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return {
        stars,
        count,
        percentage
      };
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalReviews,
        averageRating,
        statusCounts,
        breakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSpace,
  getOwnerSpaces,
  getSpaceById,
  updateSpace,
  deleteSpace,
  getSpaceMetrics
};
