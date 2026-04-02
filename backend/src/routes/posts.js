const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');


router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});


router.post('/', protect, upload.single('image'), async (req, res) => {
  const { text } = req.body;
  const imageBuffer = req.file?.buffer; // Buffer from multer memoryStorage

  if (!text && !imageBuffer) {
    return res.status(400).json({ message: 'Post must have either text or an image' });
  }

  try {
    let imageUrl = '';

    if (imageBuffer) {
      imageUrl = await uploadToCloudinary(imageBuffer);
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar || '',
      text: text || '',
      image: imageUrl,            // Cloudinary secure URL stored in MongoDB
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(400).json({ message: error.message });
  }
});


router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const username = req.user.username;
    const alreadyLiked = post.likedBy.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId.toString());
      post.likes = post.likes.filter((u) => u !== username);
    } else {
      post.likedBy.push(userId);
      post.likes.push(username);
    }

    await post.save();
    res.json({
      likes: post.likes,
      likedBy: post.likedBy,
      likeCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

router.post('/:id/comment', protect, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ username: req.user.username, userId: req.user._id, text: text.trim() });
    await post.save();

    const saved = post.comments[post.comments.length - 1];
    res.status(201).json({ comment: saved, commentCount: post.comments.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding comment' });
  }
});


router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('comments');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching comments' });
  }
});


router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete the image from Cloudinary before removing the post from DB
    if (post.image) {
      await deleteFromCloudinary(post.image);
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

module.exports = router;
