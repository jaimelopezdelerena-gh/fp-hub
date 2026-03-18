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
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            // Default avatar color logic based on first letter or random could go here
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

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ msg: 'No se encontró un usuario con ese correo electrónico' });
        }

        // Generate raw token
        const resetToken = require('crypto').randomBytes(20).toString('hex');

        // Note: In a true prod app this should be hashed in the DB, but since its a school project plain hex is fine for simplicity
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        const message = `Estás recibiendo este correo porque tú (u otra persona) ha solicitado restablecer la contraseña de tu cuenta de ApuntesIT.\n\nPor favor, haz clic en el siguiente enlace para completar el proceso:\n\n${resetUrl}\n\nSi no lo solicitaste, simplemente ignora este correo.`;

        try {
            const sendEmail = require('../utils/sendEmail');
            await sendEmail({
                email: user.email,
                subject: 'Recuperación de Contraseña - ApuntesIT',
                message
            });
            res.json({ msg: 'Correo enviado correctamente' });
        } catch (error) {
            console.error(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ msg: 'Fallo al enviar el correo. ¿Están bien las credenciales SMTP en el .env?' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'El token de recuperación es inválido o ha caducado' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ msg: 'Contraseña restablecida con éxito' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
