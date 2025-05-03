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

  const users = await Message.aggregate([
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
        }
      }
    },
    {
      $group: {
        _id: "$user"
      }
    }
  ]);

  const ids = users.map(u => u._id);
  const result = await User.find({ _id: { $in: ids } }).select('_id name');
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

  const io = req.app.locals.io;
  if (io) {
    io.to(recipientId).emit('private_message', message);
  }

  res.status(201).json(message);
});

module.exports = router;
