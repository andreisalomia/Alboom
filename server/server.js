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
  console.log("New socket connected:", socket.id);

  socket.on('register', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room [socket: ${socket.id}]`);
    } else {
      console.warn("register called with invalid userId:", userId);
    }
  });

  // socket.on("send_message", (msg) => {
  //   if (msg?.recipient && msg?.sender && msg?.content) {
  //     console.log(`Message from ${msg.sender} to ${msg.recipient}:`, msg.content);
  //     io.to(msg.recipient).emit("receive_message", msg);
  //   } else {
  //     console.warn("Invalid message payload:", msg);
  //   }
  // });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.locals.io = io;

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/music', require('./routes/music'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/threads', require('./routes/threads'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));
//app.use('/api/events', require('./routes/events'));

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
