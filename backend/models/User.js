const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatarColor: { type: String },
    avatarUrl: { type: String },
    bannerColor: { type: String, default: 'from-blue-500 to-indigo-600' },
    points: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

module.exports = mongoose.model('User', UserSchema);
