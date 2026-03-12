require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected to Production');
        try {
            const adminUser = await User.findOneAndUpdate(
                { email: 'jaime.lopezdelerena@gmail.com' },
                { $set: { role: 'admin' } },
                { new: true }
            );
            if (adminUser) {
                console.log(`Updated user ${adminUser.email} to admin.`);
            } else {
                console.log('User jaime.lopezdelerena@gmail.com not found.');
            }
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
