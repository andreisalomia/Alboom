const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const Artist = require('./models/Artist');
const Album = require('./models/Album');
const Song = require('./models/Song');

const arcticId = new mongoose.Types.ObjectId();
const taylorId = new mongoose.Types.ObjectId();
const kendrickId = new mongoose.Types.ObjectId();

const amId = new mongoose.Types.ObjectId();
const t1989Id = new mongoose.Types.ObjectId();
const damnId = new mongoose.Types.ObjectId();

const bcrypt = require('bcryptjs');
const User = require('./models/User');

const artists = [
  {
    _id: arcticId,
    name: 'Arctic Monkeys',
    bio: 'An English rock band formed in Sheffield in 2002.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/%22AM%22_%28Arctic_Monkeys%29.jpg'
  },
  {
    _id: taylorId,
    name: 'Taylor Swift',
    bio: 'American singer-songwriter known for narrative songs about her personal life.',
    image: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png'
  },
  {
    _id: kendrickId,
    name: 'Kendrick Lamar',
    bio: 'American rapper known for introspective lyrics and powerful performances.',
    image: 'https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png'
  }
];

const albums = [
  {
    _id: amId,
    title: 'AM',
    artist: arcticId,
    genre: 'Indie Rock',
    releaseDate: new Date('2013-09-09'),
    coverImage: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/%22AM%22_%28Arctic_Monkeys%29.jpg'
  },
  {
    _id: t1989Id,
    title: '1989',
    artist: taylorId,
    genre: 'Pop',
    releaseDate: new Date('2014-10-27'),
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png'
  },
  {
    _id: damnId,
    title: 'DAMN.',
    artist: kendrickId,
    genre: 'Hip Hop',
    releaseDate: new Date('2017-04-14'),
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png'
  }
];

const songs = [
  // Arctic Monkeys - AM
  { title: 'Do I Wanna Know?', duration: 272, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'R U Mine?', duration: 212, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'One for the Road', duration: 223, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'Arabella', duration: 209, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'I Want It All', duration: 179, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'No. 1 Party Anthem', duration: 240, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'Mad Sounds', duration: 233, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'Fireside', duration: 195, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: "Why'd You Only Call Me When You're High?", duration: 164, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'Snap Out of It', duration: 209, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'Knee Socks', duration: 251, genre: 'Indie Rock', album: amId, artist: arcticId },
  { title: 'I Wanna Be Yours', duration: 189, genre: 'Indie Rock', album: amId, artist: arcticId },

  // Taylor Swift - 1989
  { title: 'Blank Space', duration: 231, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'Style', duration: 231, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'Welcome to New York', duration: 212, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'Out of the Woods', duration: 235, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'All You Had to Do Was Stay', duration: 193, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'Shake It Off', duration: 219, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'I Wish You Would', duration: 211, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'Bad Blood', duration: 211, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'Wildest Dreams', duration: 220, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'How You Get the Girl', duration: 246, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'This Love', duration: 247, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'I Know Places', duration: 222, genre: 'Pop', album: t1989Id, artist: taylorId },
  { title: 'Clean', duration: 269, genre: 'Pop', album: t1989Id, artist: taylorId },

  // Kendrick Lamar - DAMN.
  { title: 'DNA.', duration: 223, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'HUMBLE.', duration: 177, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'BLOOD.', duration: 116, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'YAH.', duration: 174, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'ELEMENT.', duration: 230, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'FEEL.', duration: 214, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'LOYALTY. (feat. Rihanna)', duration: 227, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'PRIDE.', duration: 254, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'LUST.', duration: 309, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'LOVE. (feat. Zacari)', duration: 228, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'XXX. (feat. U2)', duration: 258, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'FEAR.', duration: 444, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'GOD.', duration: 246, genre: 'Hip Hop', album: damnId, artist: kendrickId },
  { title: 'DUCKWORTH.', duration: 243, genre: 'Hip Hop', album: damnId, artist: kendrickId },
];


async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Artist.deleteMany({});
    await Album.deleteMany({});
    await Song.deleteMany({});

    await Artist.insertMany(artists);
    await Album.insertMany(albums);
    await Song.insertMany(songs);

    const admin = {
      name: 'Admin Alboom',
      email: 'admin@alboom.com',
      password: await bcrypt.hash('adminpass123', 10),
      role: 'admin',
      profileImage: 'https://via.placeholder.com/150'
    };
    await User.create(admin);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
