const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/informatica-web')
    .then(() => mongoose.connection.db.collection('users').updateOne({ email: 'byelecprol@gmail.com' }, { $set: { role: 'admin' } }))
    .then(() => { console.log("User made admin."); process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); });
