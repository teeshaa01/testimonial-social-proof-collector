const express = require('express');
const router = express.Router();
const {
  getSpaceTestimonials,
  updateTestimonialStatus,
  toggleFeature,
  toggleLike,
  deleteTestimonial
} = require('../controllers/testimonial.controller');
const { authenticateOwner } = require('../middleware/auth.middleware');

router.use(authenticateOwner);

router.get('/space/:spaceId', getSpaceTestimonials);
router.patch('/:id/status', updateTestimonialStatus);
router.patch('/:id/feature', toggleFeature);
router.patch('/:id/like', toggleLike);
router.delete('/:id', deleteTestimonial);

module.exports = router;
