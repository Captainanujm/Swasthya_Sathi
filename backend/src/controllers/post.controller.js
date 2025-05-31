const Post = require('../models/post.model');
const Follow = require('../models/follow.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const { validationResult } = require('express-validator');

// Create a new post (doctor only)
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array()
      });
    }

    const { imageUrl, caption } = req.body;
    
    if (!imageUrl || !caption) {
      return res.status(400).json({
        status: 'fail',
        message: 'Image URL and caption are required'
      });
    }

    // Check if user is a doctor
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor || doctor.approvalStatus !== 'approved') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only approved doctors can create posts'
      });
    }

    // Create the post
    const post = await Post.create({
      doctor: req.user.id,
      imageUrl,
      caption
    });

    res.status(201).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get all posts for a specific doctor
exports.getDoctorPosts = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Check if doctor exists and is approved
    const doctor = await Doctor.findOne({ user: doctorId });
    
    if (!doctor || doctor.approvalStatus !== 'approved') {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found or not approved'
      });
    }
    
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Post.countDocuments({ doctor: doctorId });
    
    // Get posts with user details
    const posts = await Post.find({ doctor: doctorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Check if the current user has liked/disliked each post
    let postsWithStatus = posts;
    
    if (req.user) {
      postsWithStatus = posts.map(post => {
        const postObj = post.toObject();
        postObj.hasLiked = post.likes.includes(req.user.id);
        postObj.hasDisliked = post.dislikes.includes(req.user.id);
        postObj.likesCount = post.likes.length;
        postObj.dislikesCount = post.dislikes.length;
        return postObj;
      });
    }
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        posts: postsWithStatus
      }
    });
  } catch (err) {
    console.error('Error getting doctor posts:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get posts from doctors that a patient follows
exports.getFollowedDoctorsPosts = async (req, res) => {
  try {
    // This endpoint is only for patients
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only patients can view followed doctors posts'
      });
    }
    
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get all doctors that the current user follows
    const followedDoctors = await Follow.find({ patient: req.user.id }).select('doctor');
    const followedDoctorIds = followedDoctors.map(follow => follow.doctor);
    
    if (followedDoctorIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        total: 0,
        totalPages: 0,
        currentPage: page,
        data: {
          posts: []
        }
      });
    }
    
    // Get total count for pagination
    const total = await Post.countDocuments({ doctor: { $in: followedDoctorIds } });
    
    // Get posts from followed doctors
    const posts = await Post.find({ doctor: { $in: followedDoctorIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'doctor',
        select: 'name email profileImage'
      });
    
    // Add like/dislike status for the current user
    const postsWithStatus = posts.map(post => {
      const postObj = post.toObject();
      postObj.hasLiked = post.likes.includes(req.user.id);
      postObj.hasDisliked = post.dislikes.includes(req.user.id);
      postObj.likesCount = post.likes.length;
      postObj.dislikesCount = post.dislikes.length;
      return postObj;
    });
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        posts: postsWithStatus
      }
    });
  } catch (err) {
    console.error('Error getting followed doctors posts:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get my own posts (doctor only)
exports.getMyPosts = async (req, res) => {
  try {
    // This endpoint is only for doctors
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only doctors can view their own posts'
      });
    }
    
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Post.countDocuments({ doctor: req.user.id });
    
    // Get posts
    const posts = await Post.find({ doctor: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Transform posts to include counts
    const transformedPosts = posts.map(post => {
      const postObj = post.toObject();
      postObj.likesCount = post.likes.length;
      postObj.dislikesCount = post.dislikes.length;
      return postObj;
    });
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        posts: transformedPosts
      }
    });
  } catch (err) {
    console.error('Error getting my posts:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'fail',
        message: 'Post not found'
      });
    }
    
    // Check if user already liked the post
    const alreadyLiked = post.likes.includes(req.user.id);
    
    // If already liked, remove the like (toggle)
    if (alreadyLiked) {
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: req.user.id }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Post unliked successfully',
        data: {
          liked: false
        }
      });
    }
    
    // Remove from dislikes if present
    const alreadyDisliked = post.dislikes.includes(req.user.id);
    if (alreadyDisliked) {
      await Post.findByIdAndUpdate(postId, {
        $pull: { dislikes: req.user.id }
      });
    }
    
    // Add the like
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: req.user.id }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Post liked successfully',
      data: {
        liked: true
      }
    });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'fail',
        message: 'Post not found'
      });
    }
    
    // Check if user already disliked the post
    const alreadyDisliked = post.dislikes.includes(req.user.id);
    
    // If already disliked, remove the dislike (toggle)
    if (alreadyDisliked) {
      await Post.findByIdAndUpdate(postId, {
        $pull: { dislikes: req.user.id }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Post undisliked successfully',
        data: {
          disliked: false
        }
      });
    }
    
    // Remove from likes if present
    const alreadyLiked = post.likes.includes(req.user.id);
    if (alreadyLiked) {
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: req.user.id }
      });
    }
    
    // Add the dislike
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { dislikes: req.user.id }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Post disliked successfully',
      data: {
        disliked: true
      }
    });
  } catch (err) {
    console.error('Error disliking post:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Delete a post (owner doctor only)
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'fail',
        message: 'Post not found'
      });
    }
    
    // Check if the requesting user is the owner
    if (post.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only delete your own posts'
      });
    }
    
    // Delete the post
    await Post.findByIdAndDelete(postId);
    
    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
}; 