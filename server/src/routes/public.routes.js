const express = require('express');
const router = express.Router();
const {
  getPublicSpace,
  submitTestimonial,
  getPublicWall
} = require('../controllers/public.controller');
const { upload } = require('../middleware/upload.middleware');

router.get('/spaces/:slug', getPublicSpace);
router.post('/testimonials/:slug', upload.single('avatar'), submitTestimonial);
router.get('/wall/:slug', getPublicWall);

module.exports = router;
