const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// ✅ Listă cu toți utilizatorii cu care userul a vorbit
router.get('/conversations', auth, async (req, res) => {
  const userId = req.user.id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const latestMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userObjectId },
          { recipient: userObjectId }
        ]
      }
    },
    {
      $project: {
        user: {
          $cond: [
            { $eq: ["$sender", userObjectId] },
            "$recipient",
            "$sender"
          ]
        },
        content: 1,
        createdAt: 1
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: "$user",
        lastMessage: { $first: "$content" },
        lastTime: { $first: "$createdAt" }
      }
    },
    {
      $match: { _id: { $ne: userObjectId } }
    }
  ]);

  const ids = latestMessages.map(m => m._id);
  const users = await User.find({ _id: { $in: ids } }).select('_id name');

  // Join user data and message content
  const result = latestMessages.map(m => {
    const user = users.find(u => u._id.toString() === m._id.toString());
    return {
      _id: m._id,
      name: user?.name || "Unknown",
      lastMessage: m.lastMessage,
      lastTime: m.lastTime
    };
  });

  res.json(result);
});

router.get('/:userId', auth, async (req, res) => {
  const userId = req.params.userId;
  const myId = req.user.id;

  const messages = await Message.find({
    $or: [
      { sender: myId, recipient: userId },
      { sender: userId, recipient: myId }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});


router.post('/', auth, async (req, res) => {
  const { recipientId, content } = req.body;
  if (!recipientId || !content) {
    return res.status(400).json({ message: "Recipient and content required" });
  }

  const message = await Message.create({
    sender: req.user.id,
    recipient: recipientId,
    content
  });

  await message.populate("sender", "name");

  const io = req.app.locals.io;
  if (io) {
    io.to(recipientId).emit('receive_message', {
      ...message.toObject(),
      sender: message.sender._id.toString(),      // 🔧 important
      senderName: message.sender.name
    });
  }

  res.status(201).json(message);
});

module.exports = router;
