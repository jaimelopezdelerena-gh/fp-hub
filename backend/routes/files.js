const express = require('express');
const router = express.Router();
const File = require('../models/File');

// @route   GET api/files/download/:id
// @desc    Download a file by ID
// @access  Public
router.get('/download/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ msg: 'File not found' });
        }

        res.set({
            'Content-Type': file.mimetype,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
            'Content-Length': file.size
        });

        res.send(file.data);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'File not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/files/view/:id
// @desc    View a file by ID (e.g. images) inline
// @access  Public
router.get('/view/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ msg: 'File not found' });
        }

        res.set({
            'Content-Type': file.mimetype,
            'Content-Disposition': `inline; filename="${encodeURIComponent(file.originalName)}"`,
            'Content-Length': file.size
        });

        res.send(file.data);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'File not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
