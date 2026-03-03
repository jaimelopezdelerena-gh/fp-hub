const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

mongoose.connect('mongodb://localhost:27017/apuntesit')
    .then(async () => {
        console.log('MongoDB Connected');
        try {
            // Find the mocked users excluding the admin ItssRoar
            const users = await User.find({ role: 'user' }).sort({ points: -1 });

            if (users.length >= 6) {
                // We have the 6 seeded users.
                // 1. Delete the 6th one (Lowest points)
                const userToDelete = users[5];
                await Post.deleteMany({ author: userToDelete._id });
                await User.findByIdAndDelete(userToDelete._id);
                console.log(`Deleted user: ${userToDelete.name} and their posts.`);

                // 2. Assign the 5 real avatars (which we copied to server/uploads) to the 5 remaining
                const avatars = [
                    '/uploads/real_avatar1.png',
                    '/uploads/real_avatar2.png',
                    '/uploads/real_avatar3.jpg',
                    '/uploads/real_avatar4.png',
                    '/uploads/real_avatar5.png'
                ];

                for (let i = 0; i < 5; i++) {
                    users[i].avatarUrl = avatars[i];
                    await users[i].save();
                    console.log(`Assigned ${avatars[i]} to ${users[i].name}`);
                }
            } else {
                console.log('Could not find enough seeded users. Skip rewriting avatars.');
            }

            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => console.log(err));
