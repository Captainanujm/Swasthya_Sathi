const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'prescription', 'swasthyaCard'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  // For swasthyaCard messages, store the patient ID
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For swasthyaCard messages, store card data
  cardData: {
    type: Object
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessage: -1 });

// Virtual property to get chat name
chatSchema.virtual('chatName').get(function() {
  return `Chat between ${this.participants.length} users`;
});

// Method to add a message to the chat
chatSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastMessage = Date.now();
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
    }
  });
  return this.save();
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 