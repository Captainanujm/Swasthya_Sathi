const Chat = require('../models/chat.model');
const User = require('../models/user.model');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all chats where the user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email profileImage role')
      .sort({ lastMessage: -1 });
    
    // Format the chats for response
    const formattedChats = chats.map(chat => {
      // Get the other participant (for 1-on-1 chats)
      const otherParticipant = chat.participants.find(
        participant => participant._id.toString() !== userId
      );
      
      return {
        id: chat._id,
        participant: otherParticipant,
        lastActivity: chat.lastMessage,
        unreadCount: chat.messages.filter(
          message => 
            message.sender.toString() !== userId && 
            !message.readBy.includes(userId)
        ).length,
        latestMessage: chat.messages.length > 0 ? 
          chat.messages[chat.messages.length - 1] : null
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: formattedChats.length,
      data: {
        chats: formattedChats
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get chat by ID or create a new chat
exports.getChatByIdOrCreate = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    // Check if the user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if a chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate('participants', 'name email profileImage role');
    
    if (existingChat) {
      // Mark all messages as read
      existingChat.messages.forEach(message => {
        if (
          message.sender.toString() !== currentUserId && 
          !message.readBy.includes(currentUserId)
        ) {
          message.readBy.push(currentUserId);
        }
      });
      
      await existingChat.save();
      
      return res.status(200).json({
        status: 'success',
        data: {
          chat: existingChat
        }
      });
    }
    
    // Create a new chat
    const newChat = await Chat.create({
      participants: [currentUserId, userId],
      messages: []
    });
    
    // Populate the participants
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email profileImage role');
    
    res.status(201).json({
      status: 'success',
      data: {
        chat: populatedChat
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType, fileUrl, fileName, patientId, cardData } = req.body;
    const senderId = req.user.id;
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chat not found'
      });
    }
    
    // Check if the user is a participant
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a participant in this chat'
      });
    }
    
    // Create the message
    const newMessage = {
      sender: senderId,
      content,
      messageType: messageType || 'text',
      fileUrl,
      fileName,
      readBy: [senderId],
      createdAt: new Date()
    };
    
    // For swasthyaCard messages, add patient ID and card data
    if (messageType === 'swasthyaCard' && patientId) {
      newMessage.patientId = patientId;
      newMessage.cardData = cardData;
    }
    
    // Add the message to the chat
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    
    await chat.save();
    
    // Get the updated chat with populated data
    const updatedChat = await Chat.findById(chatId)
      .populate('participants', 'name email profileImage role')
      .populate('messages.sender', 'name email profileImage role')
      .populate('messages.patientId', 'name email profileImage role');
    
    res.status(201).json({
      status: 'success',
      data: {
        message: updatedChat.messages[updatedChat.messages.length - 1],
        chat: updatedChat
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chat not found'
      });
    }
    
    // Check if the user is a participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a participant in this chat'
      });
    }
    
    // Mark messages as read
    let updated = false;
    chat.messages.forEach(message => {
      if (
        message.sender.toString() !== userId && 
        !message.readBy.includes(userId)
      ) {
        message.readBy.push(userId);
        updated = true;
      }
    });
    
    if (updated) {
      await chat.save();
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get chat with a specific user
exports.getChatWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    // Check if the user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if a chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    })
    .populate('participants', 'name email profileImage role')
    .populate('messages.sender', 'name email profileImage role');
    
    if (existingChat) {
      // Mark all messages as read
      existingChat.messages.forEach(message => {
        if (
          message.sender._id.toString() !== currentUserId && 
          !message.readBy.includes(currentUserId)
        ) {
          message.readBy.push(currentUserId);
        }
      });
      
      await existingChat.save();
      
      return res.status(200).json({
        status: 'success',
        data: {
          chat: existingChat
        }
      });
    }
    
    // Create a new chat
    const newChat = await Chat.create({
      participants: [currentUserId, userId],
      messages: []
    });
    
    // Populate the participants
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email profileImage role');
    
    res.status(201).json({
      status: 'success',
      data: {
        chat: populatedChat
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get a specific chat by ID
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Find the chat
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email profileImage role')
      .populate('messages.sender', 'name email profileImage role');
    
    if (!chat) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chat not found'
      });
    }
    
    // Check if the user is a participant
    if (!chat.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a participant in this chat'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        chat
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Start a new chat
exports.startNewChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user.id;
    
    // Prevent creating a chat with oneself
    if (recipientId === currentUserId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot start a chat with yourself'
      });
    }
    
    // Check if the recipient exists
    const recipientExists = await User.findById(recipientId);
    if (!recipientExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'Recipient not found'
      });
    }
    
    // Check if a chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, recipientId] }
    }).populate('participants', 'name email profileImage role');
    
    if (existingChat) {
      return res.status(200).json({
        status: 'success',
        message: 'Chat already exists',
        data: {
          chat: existingChat
        }
      });
    }
    
    // Create a new chat
    const newChat = await Chat.create({
      participants: [currentUserId, recipientId],
      messages: []
    });
    
    // Populate the participants
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email profileImage role');
    
    res.status(201).json({
      status: 'success',
      data: {
        chat: populatedChat
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Upload a file for chat
exports.uploadFile = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Check if file exists in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }
    
    // Get the uploaded file
    const file = req.files.file;
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chat not found'
      });
    }
    
    // Check if the user is a participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not a participant in this chat'
      });
    }
    
    // Generate a secure filename to prevent directory traversal attacks
    const timestamp = Date.now();
    const secureName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9-_.]/g, '')}`;
    
    // Set upload directory
    const uploadPath = `${process.env.FILE_UPLOAD_PATH || 'uploads'}/chat/${chatId}`;
    
    // Ensure the upload directory exists
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Save the file
    const filePath = `${uploadPath}/${secureName}`;
    
    await file.mv(filePath);
    
    // Generate file URL
    // const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const baseUrl="https://swasthya-sathi-6.onrender.com";
    const fileUrl = `${baseUrl}/uploads/chat/${chatId}/${secureName}`;
    
    res.status(200).json({
      status: 'success',
      data: {
        fileUrl,
        fileName: file.name
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({
      status: 'error',
      message: 'File upload failed'
    });
  }
}; 