const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Administrator privileges required.' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route   POST api/admin/report/:postId
// @desc    Report a post (accessible by any logged in user)
// @access  Private
router.post('/report/:postId', auth, async (req, res) => {
    try {
        const newReport = new Report({
            post: req.params.postId,
            reportedBy: req.user.id,
            reason: req.body.reason || 'Conenido inapropiado',
        });
        const report = await newReport.save();
        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/reports
// @desc    Get all active reports
// @access  Private Admin
router.get('/reports', [auth, adminAuth], async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' })
            .populate({
                path: 'post',
                select: ['title', 'category', 'status', 'author'],
                populate: { path: 'author', select: ['name', 'avatarUrl', 'avatarColor'] }
            })
            .populate('reportedBy', ['name', 'avatarUrl', 'avatarColor']);
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/post/:postId/status
// @desc    Update a post status (block/allow)
// @access  Private Admin
router.put('/post/:postId/status', [auth, adminAuth], async (req, res) => {
    try {
        const { status } = req.body;
        let post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        post.status = status; // 'active' or 'blocked'
        await post.save();

        // Mark related reports as resolved
        if (status === 'blocked') {
            await Report.updateMany({ post: post._id, status: 'pending' }, { $set: { status: 'resolved' } });
        } else {
            await Report.updateMany({ post: post._id, status: 'pending' }, { $set: { status: 'dismissed' } });
        }

        res.json({ msg: `Post status updated to ${status}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/users
// @desc    Get all users for admin list
// @access  Private Admin
router.get('/users', [auth, adminAuth], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/user/:userId/role
// @desc    Change user role (e.g., ban/block by assigning blocked role if we add one, or simply delete)
// @access  Private Admin
router.put('/user/:userId/role', [auth, adminAuth], async (req, res) => {
    try {
        // For simplicity, lets say 'blocked' role doesn't exist yet but we can just delete or update
        // We will just let admin delete the user for now to uncomplicate
        let user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ msg: 'Cannot modify admin' });

        // Delete all posts explicitly by this user
        await Post.deleteMany({ author: req.params.userId });

        // Remove likes given by this user in all posts
        await Post.updateMany({}, { $pull: { likes: req.params.userId, dislikes: req.params.userId } });

        // Remove active reports made by this user
        await Report.deleteMany({ reportedBy: req.params.userId });

        // Easiest is to literally remove the user from db to ban them
        await User.findByIdAndDelete(req.params.userId);
        res.json({ msg: 'User account removed/blocked' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/stats
// @desc    Get general statistics
// @access  Private Admin
router.get('/stats', [auth, adminAuth], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const activeReports = await Report.countDocuments({ status: 'pending' });

        res.json({ totalUsers, totalPosts, activeReports });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
