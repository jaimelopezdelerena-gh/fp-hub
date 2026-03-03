const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');

mongoose.connect('mongodb://localhost:27017/apuntesit')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const seedDatabase = async () => {
    try {
        // Clear Existing Users and Posts
        await User.deleteMany({});
        await Post.deleteMany({});

        console.log('Cleared database items.');

        // Admins to keep or recreate:
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await User.create({
            name: 'ItssRoar',
            email: 'byelecprol@gmail.com',
            password: hashedPassword,
            role: 'admin',
            points: 1500,
            avatarColor: 'bg-indigo-600',
            avatarUrl: ''
        });

        // Add 6 dummy users
        const mockUsers = [
            { name: "Lucía Fernández", email: "lucia@test.com", avatarUrl: "/uploads/seed_avatar1.png", points: 2100 },
            { name: "Marcos Torres", email: "marcos@test.com", avatarUrl: "/uploads/seed_avatar2.png", points: 950 },
            { name: "Elena Gómez", email: "elena@test.com", avatarUrl: "/uploads/seed_avatar3.png", points: 1200 },
            { name: "Daniel Ruiz", email: "daniel@test.com", avatarUrl: "/uploads/seed_avatar4.png", points: 400 },
            { name: "Sofía Blanco", email: "sofia@test.com", avatarUrl: "/uploads/seed_avatar5.png", points: 3000 },
            { name: "Javier Muñoz", email: "javier@test.com", avatarUrl: "/uploads/seed_avatar6.png", points: 150 }
        ];

        const usersCreated = [];
        for (let u of mockUsers) {
            u.password = hashedPassword;
            const newUser = new User(u);
            usersCreated.push(await newUser.save());
        }

        console.log('Created 6 seeded users.');

        // Insert posts
        const categories = ['ASIR', 'DAW', 'DAM', 'SMR'];
        for (let user of usersCreated) {
            for (let cat of categories) {
                const newPost = new Post({
                    title: `Apuntes Completos de ${cat} por ${user.name}`,
                    description: `Estos son unos apuntes súper detallados creados para la asignatura de ${cat}. Contienen todo el temario del primer y segundo trimestre organizado y resumido. ¡Espero que os sirva para estudiar el examen final!`,
                    category: cat,
                    author: user._id,
                    previewUrl: `/uploads/seed_preview_${cat.toLowerCase()}.jpg`,
                    files: [
                        { filename: 'apuntes_seed.pdf', originalName: `Apuntes_${cat}.pdf`, path: '/uploads/seed_apuntes.pdf', mimetype: 'application/pdf' }
                    ]
                });
                await newPost.save();
            }
        }

        console.log('Created 24 seeded posts (4 per user).');

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedDatabase();
