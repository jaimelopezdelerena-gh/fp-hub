const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['ASIR', 'DAW', 'DAM', 'SMR'], required: true },
    contentUrl: { type: String }, // Placeholder for actual file upload URL later
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    viewedBy: [{ type: String }],
    previewUrl: { type: String },
    files: [{
        filename: String,
        originalName: String,
        path: String,
        mimetype: String
    }],
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' }
});

module.exports = mongoose.model('Post', PostSchema);
