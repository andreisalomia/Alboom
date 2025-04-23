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
  {
    title: 'Do I Wanna Know?',
    duration: 272,
    genre: 'Indie Rock',
    album: amId,
    artist: arcticId
  },
  {
    title: 'R U Mine?',
    duration: 212,
    genre: 'Indie Rock',
    album: amId,
    artist: arcticId
  },
  {
    title: 'Blank Space',
    duration: 231,
    genre: 'Pop',
    album: t1989Id,
    artist: taylorId
  },
  {
    title: 'Style',
    duration: 231,
    genre: 'Pop',
    album: t1989Id,
    artist: taylorId
  },
  {
    title: 'HUMBLE.',
    duration: 177,
    genre: 'Hip Hop',
    album: damnId,
    artist: kendrickId
  },
  {
    title: 'DNA.',
    duration: 223,
    genre: 'Hip Hop',
    album: damnId,
    artist: kendrickId
  }
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

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
