const express = require('express');
const router = express.Router();
const {
  createSpace,
  getOwnerSpaces,
  getSpaceById,
  updateSpace,
  deleteSpace,
  getSpaceMetrics
} = require('../controllers/space.controller');
const { authenticateOwner } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.use(authenticateOwner);

router.get('/', getOwnerSpaces);
router.post('/', upload.single('brandLogo'), createSpace);
router.get('/:id', getSpaceById);
router.put('/:id', upload.single('brandLogo'), updateSpace);
router.delete('/:id', deleteSpace);
router.get('/:id/metrics', getSpaceMetrics);

module.exports = router;
