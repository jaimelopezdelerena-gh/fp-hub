const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/apuntesit')
    .then(async () => {
        console.log('MongoDB Connected');
        try {
            // Update the new admin user
            const adminUser = await User.findOneAndUpdate(
                { email: 'jaime.lopezdelerena@gmail.com' },
                { $set: { role: 'admin' } },
                { new: true }
            );
            if (adminUser) {
                console.log(`Updated user ${adminUser.email} to admin.`);
            } else {
                console.log('User jaime.lopezdelerena@gmail.com not found. Register this account first.');
            }

            // In recent migrations, "bannerColor" defaults might not have applied if user sent an empty string or if it was overridden.
            // Let's ensure ALL users who have a blank or 'bg-gray-500' banner have the blue gradient.
            const result = await User.updateMany(
                { $or: [{ bannerColor: { $exists: false } }, { bannerColor: 'bg-gray-500' }, { bannerColor: '' }] },
                { $set: { bannerColor: 'from-blue-500 to-indigo-600' } }
            );
            console.log(`Updated default banner color for ${result.modifiedCount} users.`);

            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => console.log(err));
