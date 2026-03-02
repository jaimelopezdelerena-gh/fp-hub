const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET api/users/top
// @desc    Get top 10 users by points
// @access  Public
router.get('/top', async (req, res) => {
    try {
        const topUsers = await User.find()
            .select('name avatarUrl avatarColor points role')
            .sort({ points: -1 })
            .limit(10);
        res.json(topUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/profile/:id
// @desc    Get public user profile
// @access  Public
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name avatarUrl avatarColor bannerColor points role createdAt');

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
