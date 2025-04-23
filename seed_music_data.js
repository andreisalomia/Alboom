
db.artists.deleteMany({});
db.artists.insertMany([
  {
    "_id": "78fe2476-2980-4d04-a4e6-177e542cc4a0",
    "name": "Arctic Monkeys",
    "bio": "An English rock band formed in Sheffield in 2002.",
    "image": "https://upload.wikimedia.org/wikipedia/en/5/5f/Arctic_Monkeys_-_AM.png"
  },
  {
    "_id": "b1c66d8a-ef17-451c-94b4-e6b14be2d786",
    "name": "Taylor Swift",
    "bio": "American singer-songwriter known for narrative songs about her personal life.",
    "image": "https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png"
  },
  {
    "_id": "0ea068f8-e8c2-4df4-afd3-16ca19af492b",
    "name": "Kendrick Lamar",
    "bio": "American rapper known for introspective lyrics and powerful performances.",
    "image": "https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png"
  }
]);

db.albums.deleteMany({});
db.albums.insertMany([
  {
    "_id": "f556a030-3c1e-4426-afbc-7e2ea90e49a3",
    "title": "AM",
    "artist": "78fe2476-2980-4d04-a4e6-177e542cc4a0",
    "genre": "Indie Rock",
    "releaseDate": "2013-09-09T00:00:00Z",
    "coverImage": "https://upload.wikimedia.org/wikipedia/en/5/5f/Arctic_Monkeys_-_AM.png"
  },
  {
    "_id": "0a703af1-75e0-49cf-a7b2-c50dbc872d3b",
    "title": "1989",
    "artist": "b1c66d8a-ef17-451c-94b4-e6b14be2d786",
    "genre": "Pop",
    "releaseDate": "2014-10-27T00:00:00Z",
    "coverImage": "https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png"
  },
  {
    "_id": "23652c75-c470-44b2-af8f-08a90b4e2403",
    "title": "DAMN.",
    "artist": "0ea068f8-e8c2-4df4-afd3-16ca19af492b",
    "genre": "Hip Hop",
    "releaseDate": "2017-04-14T00:00:00Z",
    "coverImage": "https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png"
  }
]);

db.songs.deleteMany({});
db.songs.insertMany([
  {
    "title": "Do I Wanna Know?",
    "duration": 272,
    "genre": "Indie Rock",
    "album": "f556a030-3c1e-4426-afbc-7e2ea90e49a3",
    "artist": "78fe2476-2980-4d04-a4e6-177e542cc4a0"
  },
  {
    "title": "R U Mine?",
    "duration": 212,
    "genre": "Indie Rock",
    "album": "f556a030-3c1e-4426-afbc-7e2ea90e49a3",
    "artist": "78fe2476-2980-4d04-a4e6-177e542cc4a0"
  },
  {
    "title": "Blank Space",
    "duration": 231,
    "genre": "Pop",
    "album": "0a703af1-75e0-49cf-a7b2-c50dbc872d3b",
    "artist": "b1c66d8a-ef17-451c-94b4-e6b14be2d786"
  },
  {
    "title": "Style",
    "duration": 231,
    "genre": "Pop",
    "album": "0a703af1-75e0-49cf-a7b2-c50dbc872d3b",
    "artist": "b1c66d8a-ef17-451c-94b4-e6b14be2d786"
  },
  {
    "title": "HUMBLE.",
    "duration": 177,
    "genre": "Hip Hop",
    "album": "23652c75-c470-44b2-af8f-08a90b4e2403",
    "artist": "0ea068f8-e8c2-4df4-afd3-16ca19af492b"
  },
  {
    "title": "DNA.",
    "duration": 223,
    "genre": "Hip Hop",
    "album": "23652c75-c470-44b2-af8f-08a90b4e2403",
    "artist": "0ea068f8-e8c2-4df4-afd3-16ca19af492b"
  }
]);
