const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

mongoose.connect('mongodb://localhost:27017/apuntesit')
    .then(async () => {
        console.log('MongoDB Connected');
        try {
            // Delete ItssRoar
            const itssRoar = await User.findOne({ name: 'ItssRoar' });
            if (itssRoar) {
                await Post.deleteMany({ author: itssRoar._id });
                await User.findByIdAndDelete(itssRoar._id);
                console.log('Deleted user ItssRoar and their posts.');
            }

            // Update user Daniel Ruiz
            const daniel = await User.findOne({ name: 'Daniel Ruiz' });
            if (daniel) {
                daniel.avatarUrl = '/uploads/daniel_avatar.png';
                await daniel.save();
                console.log('Updated Daniel Ruiz avatar.');
            }

            // Update all posts previewUrl
            const result = await Post.updateMany(
                { previewUrl: { $exists: true, $ne: null } },
                { $set: { previewUrl: '/uploads/preview_notes.png' } }
            );
            console.log(`Updated ${result.modifiedCount} posts previewUrl.`);

            // Randomize scores for seeded users (except new admin) between 50 and 2500
            const usersToUpdate = await User.find({ role: 'user' });
            for (let u of usersToUpdate) {
                u.points = Math.floor(Math.random() * 2400) + 100; // 100 to 2500
                await u.save();
            }
            console.log('Randomized points for users.');

            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => console.log(err));
