const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Post = require('../models/Post');
const User = require('../models/User');
const File = require('../models/File');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, upload.fields([{ name: 'files', maxCount: 10 }]), async (req, res) => {
    try {
        const decodeUtf8 = (str) => {
            if (!str) return str;
            try { return Buffer.from(str, 'latin1').toString('utf8'); } catch (e) { return str; }
        };

        const filesToSave = [];
        if (req.files && req.files['files']) {
            for (let f of req.files['files']) {
                const newFile = new File({
                    filename: f.originalname, // mem storage uses originalname
                    originalName: decodeUtf8(f.originalname),
                    mimetype: f.mimetype,
                    size: f.size,
                    data: f.buffer
                });
                const savedFile = await newFile.save();
                filesToSave.push({
                    filename: f.originalname,
                    originalName: decodeUtf8(f.originalname),
                    path: `/api/files/download/${savedFile._id}`,
                    mimetype: f.mimetype
                });
            }
        }

        const newPost = new Post({
            title: decodeUtf8(req.body.title),
            description: decodeUtf8(req.body.description),
            category: decodeUtf8(req.body.category),
            files: filesToSave,
            author: req.user.id
        });

        const post = await newPost.save();

        // Add points to user for posting
        await User.findByIdAndUpdate(req.user.id, { $inc: { points: 5 } });

        res.json(post);
    } catch (err) {
        console.error("Crash details:", err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/category/:category
// @desc    Get posts by category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const posts = await Post.find({ category: req.params.category.toUpperCase(), status: 'active' })
            .populate('author', ['name', 'avatarColor', 'avatarUrl'])
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', ['name', 'avatarColor', 'avatarUrl']);

        if (!post || post.status !== 'active') {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Determine viewer identity
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        let viewerId = clientIp;
        const token = req.header('x-auth-token');
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                viewerId = decoded.user.id;
            } catch (err) { }
        }

        // Increment view count if not already viewed
        if (viewerId && !post.viewedBy.includes(viewerId.toString())) {
            post.viewedBy.push(viewerId.toString());
            post.views += 1;
            await post.save();
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (post.likes.some(like => like.toString() === req.user.id)) {
            // Unlike
            post.likes = post.likes.filter(like => like.toString() !== req.user.id);
            await User.findByIdAndUpdate(req.user.id, { $pull: { likedPosts: post.id } });
            await User.findByIdAndUpdate(post.author, { $inc: { points: -1 } });
        } else {
            // Remove dislike if exists
            if (post.dislikes.some(d => d.toString() === req.user.id)) {
                if (post.dislikes.length > 0 && post.dislikes.length % 5 === 0) {
                    await User.findByIdAndUpdate(post.author, { $inc: { points: 2 } });
                }
                post.dislikes = post.dislikes.filter(dislike => dislike.toString() !== req.user.id);
            }
            // Like
            post.likes.unshift(req.user.id);
            await User.findByIdAndUpdate(req.user.id, { $addToSet: { likedPosts: post.id } });
            await User.findByIdAndUpdate(post.author, { $inc: { points: 1 } });
        }

        await post.save();
        res.json({ likes: post.likes, dislikes: post.dislikes });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/dislike/:id
// @desc    Dislike a post
// @access  Private
router.put('/dislike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been disliked
        if (post.dislikes.some(dislike => dislike.toString() === req.user.id)) {
            // Remove Dislike
            if (post.dislikes.length > 0 && post.dislikes.length % 5 === 0) {
                await User.findByIdAndUpdate(post.author, { $inc: { points: 2 } });
            }
            post.dislikes = post.dislikes.filter(dislike => dislike.toString() !== req.user.id);
        } else {
            // Remove like if exists
            if (post.likes.some(l => l.toString() === req.user.id)) {
                post.likes = post.likes.filter(like => like.toString() !== req.user.id);
                await User.findByIdAndUpdate(req.user.id, { $pull: { likedPosts: post.id } });
                await User.findByIdAndUpdate(post.author, { $inc: { points: -1 } });
            }
            // Dislike
            post.dislikes.unshift(req.user.id);
            if (post.dislikes.length % 5 === 0) {
                await User.findByIdAndUpdate(post.author, { $inc: { points: -2 } });
            }
        }

        await post.save();
        res.json({ likes: post.likes, dislikes: post.dislikes });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/user/likes
// @desc    Get current user liked posts
// @access  Private
router.get('/user/likes', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'likedPosts',
            populate: { path: 'author', select: ['name', 'avatarColor', 'avatarUrl'] }
        });
        // filter out inactive liked posts
        const activeLikedPosts = user.likedPosts.filter(p => p && p.status === 'active');
        res.json(activeLikedPosts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/user/me
// @desc    Get current user own posts
// @access  Private
router.get('/user/me', auth, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id })
            .populate('author', ['name', 'avatarColor', 'avatarUrl'])
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/user/public/:id
// @desc    Get user posts by ID
// @access  Public
router.get('/user/public/:id', async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.id, status: 'active' })
            .populate('author', ['name', 'avatarColor', 'avatarUrl'])
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Match user to author
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.deleteOne();
        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
