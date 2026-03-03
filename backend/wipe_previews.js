const mongoose = require('mongoose');
const Post = require('./models/Post');

async function run() {
    await mongoose.connect('mongodb://localhost:27017/apuntesit');
    await Post.updateMany({}, { $set: { previewUrl: null } });
    console.log('Successfully wiped all previewUrl from posts');
    await mongoose.disconnect();
}
run();
