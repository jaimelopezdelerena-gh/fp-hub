const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/apuntesit').then(async () => {
    const result = await mongoose.connection.db.collection('users').updateMany(
        { bannerColor: 'bg-gray-500' },
        { $set: { bannerColor: 'from-blue-500 to-indigo-600' } }
    );
    console.log("Update result for old banners:", result);
    process.exit(0);
}).catch(console.error);
