const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');
const File = require('../models/File');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;

    try {
        if (!/^[a-zA-Z0-9_\-]+$/.test(name) || name.length > 15) {
            return res.status(400).json({ msg: 'El nombre solo puede contener letras sin acentos, números, guiones y máximo 15 caracteres' });
        }
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            securityQuestion: securityQuestion || '',
            securityAnswer: securityAnswer ? await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10) : ''
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarColor: user.avatarColor, points: user.points } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Auto-promo a admin (bypasses network restrictions to MongoDB Atlas)
        if (user.email === 'jaime.lopezdelerena@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarColor: user.avatarColor, points: user.points } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/me
// @desc    Get user by token
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/avatar
// @desc    Update user profile picture
// @access  Private
router.put('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No se subió archivo.' });

        // Save new File in MongoDB
        const newFile = new File({
            filename: req.file.originalname,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            data: req.file.buffer
        });
        const savedFile = await newFile.save();

        const user = await User.findById(req.user.id).select('-password');
        user.avatarUrl = `/api/files/view/${savedFile._id}`;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/banner
// @desc    Update user banner color
// @access  Private
router.put('/banner', auth, async (req, res) => {
    try {
        const { bannerColor } = req.body;
        if (!bannerColor) return res.status(400).json({ msg: 'Se requiere un color de banner.' });

        const user = await User.findById(req.user.id).select('-password');
        user.bannerColor = bannerColor;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/security-question
// @desc    Set or update security question for legacy users
// @access  Private
router.put('/security-question', auth, async (req, res) => {
    try {
        const { securityQuestion, securityAnswer } = req.body;
        if (!securityQuestion || !securityAnswer) {
            return res.status(400).json({ msg: 'Pregunta y respuesta son obligatorias' });
        }
        const user = await User.findById(req.user.id).select('-password');
        user.securityQuestion = securityQuestion;
        user.securityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error del servidor al guardar la pregunta' });
    }
});

// @route   POST api/auth/forgot-password
// @desc    Get security question for an email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ msg: 'No se encontró un usuario con ese correo electrónico' });
        }
        if (!user.securityQuestion) {
            return res.status(400).json({ msg: 'Este usuario es antiguo y no tiene configurada una pregunta de seguridad' });
        }

        res.json({ securityQuestion: user.securityQuestion });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/reset-password
// @desc    Reset password using security answer
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.securityAnswer) {
            return res.status(400).json({ msg: 'Usuario inválido o sin pregunta configurada' });
        }

        // Verify answer
        const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer);
        if (!isMatch) {
            return res.status(400).json({ msg: 'La respuesta de seguridad es incorrecta' });
        }

        // Update password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Contraseña restablecida con éxito' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
