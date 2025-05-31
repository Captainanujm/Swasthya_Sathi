const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { body } = require('express-validator');

// Apply auth middleware to all routes
router.use(authMiddleware.protect);

// Create a post - doctor only
router.post(
  '/',
  roleMiddleware.restrictTo('doctor'),
  [
    body('caption').notEmpty().withMessage('Caption is required').trim().isLength({ max: 500 }).withMessage('Caption must be less than 500 characters'),
    body('imageUrl').notEmpty().withMessage('Image URL is required').isURL().withMessage('Invalid image URL')
  ],
  postController.createPost
);

// Get my posts - doctor only
router.get(
  '/my-posts',
  roleMiddleware.restrictTo('doctor'),
  postController.getMyPosts
);

// Get posts from doctors that a patient follows - patient only
router.get(
  '/feed',
  roleMiddleware.restrictTo('patient'),
  postController.getFollowedDoctorsPosts
);

// Get all posts for a specific doctor - accessible to all authenticated users
router.get(
  '/doctor/:doctorId',
  postController.getDoctorPosts
);

// Like a post
router.post(
  '/:postId/like',
  postController.likePost
);

// Dislike a post
router.post(
  '/:postId/dislike',
  postController.dislikePost
);

// Delete a post - doctor only (owner)
router.delete(
  '/:postId',
  roleMiddleware.restrictTo('doctor'),
  postController.deletePost
);

module.exports = router; 