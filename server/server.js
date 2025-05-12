const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketio = require('socket.io');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

io.on('connection', (socket) => {
  // console.log(`Connected: ${socket.id}`);

  // Fiecare client se "înregistrează" cu propriul ID
  socket.on('register', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Mesaj privat trimis prin socket (opțional - fallback la REST)
  socket.on("send_message", () => {});

  // socket.on('disconnect', () => {
  //   console.log(`Disconnected: ${socket.id}`);
  // });
});

app.locals.io = io;

app.use('/api/auth', require('./routes/auth'));
app.use('/api/music', require('./routes/music'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages')); 


const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
