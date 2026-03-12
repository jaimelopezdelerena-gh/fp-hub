require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Post = require('./models/Post');
const User = require('./models/User');
const File = require('./models/File');

async function migrate() {
    try {
        await mongoose.connect('mongodb://localhost:27017/apuntesit');
        console.log('Connected to Local MongoDB. Starting migration...');

        // Migrate Posts
        const posts = await Post.find();
        let postsUpdated = 0;
        for (let post of posts) {
            let changed = false;
            if (post.files && post.files.length > 0) {
                for (let i = 0; i < post.files.length; i++) {
                    const fileObj = post.files[i];
                    if (fileObj.path && fileObj.path.includes('/uploads/')) {
                        const filename = fileObj.path.replace('/uploads/', '');
                        const physicalPath = path.join(__dirname, 'uploads', filename);
                        if (fs.existsSync(physicalPath)) {
                            const buffer = fs.readFileSync(physicalPath);
                            const stats = fs.statSync(physicalPath);
                            const newFile = new File({
                                filename: filename,
                                originalName: fileObj.originalName || filename,
                                mimetype: fileObj.mimetype || 'application/octet-stream',
                                size: stats.size,
                                data: buffer
                            });
                            const saved = await newFile.save();
                            post.files[i].path = `/api/files/download/${saved._id}`;
                            changed = true;
                            console.log(`Migrated File for post ${post._id}: ${filename}`);
                        }
                    }
                }
            }
            if (changed) {
                await post.save();
                postsUpdated++;
            }
        }
        console.log(`Migrated files for ${postsUpdated} posts.`);

        // Migrate Users avatars
        const users = await User.find();
        let usersUpdated = 0;
        for (let user of users) {
             if (user.avatarUrl && user.avatarUrl.includes('/uploads/')) {
                 const filename = user.avatarUrl.replace('/uploads/', '');
                 const physicalPath = path.join(__dirname, 'uploads', filename);
                 if (fs.existsSync(physicalPath)) {
                     const buffer = fs.readFileSync(physicalPath);
                     const stats = fs.statSync(physicalPath);
                     const newFile = new File({
                         filename: filename,
                         originalName: filename,
                         mimetype: 'image/png', // assuming images
                         size: stats.size,
                         data: buffer
                     });
                     const saved = await newFile.save();
                     user.avatarUrl = `/api/files/view/${saved._id}`;
                     await user.save();
                     usersUpdated++;
                     console.log(`Migrated Avatar for user ${user.name}: ${filename}`);
                 }
             }
        }
        console.log(`Migrated avatars for ${usersUpdated} users.`);
        console.log('Migration complete!');
        process.exit();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
