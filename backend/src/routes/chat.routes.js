const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Get all chats for a user
router.get('/user-chats', chatController.getUserChats);

// Get chat with a specific user or create one
router.get('/with-user/:userId', chatController.getChatWithUser);

// Start a new chat
router.post('/start', 
  [
    body('recipientId').not().isEmpty().withMessage('Recipient ID is required'),
  ],
  chatController.startNewChat
);

// Get a specific chat by ID
router.get('/:chatId', chatController.getChatById);

// Send a message
router.post('/:chatId/messages',
  [
    body('content').not().isEmpty().withMessage('Message content is required'),
    body('messageType')
      .optional()
      .isIn(['text', 'image', 'file', 'prescription', 'swasthyaCard'])
      .withMessage('Invalid message type'),
  ],
  chatController.sendMessage
);

// Upload a file
router.post('/:chatId/upload', chatController.uploadFile);

// Mark messages as read
router.patch('/:chatId/read', chatController.markMessagesAsRead);

module.exports = router; 