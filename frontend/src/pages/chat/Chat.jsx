import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService, patientService } from '@/lib/api';
import { toast } from 'sonner';
import { Share2, MoreVertical, Send, FileUp, FileText, QrCode, Download, Image, File, X, Loader2 } from 'lucide-react';

// Special message component for Swasthya Card messages
const SwasthyaCardMessage = ({ message, currentUser, openPatientProfile }) => {
  const isCurrentUser = typeof message.sender === 'string' 
    ? message.sender === currentUser.id 
    : message.sender._id === currentUser.id;
  
  const handleViewPatient = (e) => {
    e.stopPropagation();
    if (message.patientId) {
      openPatientProfile(message.patientId);
    }
  };
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0 overflow-hidden shadow-md border border-indigo-200">
          {(typeof message.sender !== 'string' && message.sender.profileImage) ? (
            <img 
              src={message.sender.profileImage} 
              alt={message.sender.name || 'User'} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold">
              {isCurrentUser ? currentUser.name.charAt(0) : '?'}
            </div>
          )}
        </div>
        
        <div className={`rounded-lg shadow-md ${
          isCurrentUser 
            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800'
        }`}>
          <div className="px-4 py-2">
            <div className="text-sm mb-1">
              {message.content}
            </div>
          </div>
          
          <div className="p-3 border-t border-opacity-20 border-gray-600 bg-opacity-50 bg-black rounded-b-lg">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              <div className="flex-1">
                <div className="text-xs font-semibold">Swasthya Card</div>
                <div className="text-xs opacity-70">
                  {message.cardData ? 
                    `ID: ${message.cardData.cardNumber || 'N/A'}` : 
                    'Swasthya Health ID Card'
                  }
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleViewPatient}
                className="text-xs bg-white hover:bg-blue-50 text-indigo-700 border border-indigo-200"
              >
                View
              </Button>
            </div>
          </div>
          
          <div className="px-4 py-1 text-xs opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Special message component for File/Document messages
const FileMessage = ({ message, currentUser }) => {
  const isCurrentUser = typeof message.sender === 'string' 
    ? message.sender === currentUser.id 
    : message.sender._id === currentUser.id;
  
  const handleDownload = (e) => {
    e.stopPropagation();
    if (message.fileUrl) {
      window.open(message.fileUrl, '_blank');
    }
  };
  
  const isImage = message.messageType === 'image' || 
    (message.fileName && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(message.fileName));
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0 overflow-hidden shadow-md border border-indigo-200">
          {(typeof message.sender !== 'string' && message.sender.profileImage) ? (
            <img 
              src={message.sender.profileImage} 
              alt={message.sender.name || 'User'} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold">
              {isCurrentUser ? currentUser.name.charAt(0) : '?'}
            </div>
          )}
        </div>
        
        <div className={`rounded-lg shadow-md ${
          isCurrentUser 
            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800'
        } overflow-hidden`}>
          {/* Message body */}
          <div className="px-4 py-2">
            <div className="text-sm mb-1">
              {message.content}
            </div>
          </div>
          
          {/* File preview */}
          <div className="p-3 border-t border-opacity-20 border-gray-600 bg-opacity-50 bg-black rounded-b-lg">
            {isImage ? (
              // Image preview
              <div className="max-w-xs">
                <img 
                  src={message.fileUrl} 
                  alt={message.fileName || 'Image'} 
                  className="rounded-md max-h-40 w-auto object-contain mx-auto"
                  onClick={() => window.open(message.fileUrl, '_blank')}
                />
              </div>
            ) : (
              // Document preview
              <div className="flex items-center gap-2">
                <File className="h-5 w-5" />
                <div className="flex-1">
                  <div className="text-xs font-semibold truncate max-w-[180px]">
                    {message.fileName || 'Document'}
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleDownload}
                  className="text-xs bg-white hover:bg-blue-50 text-indigo-700 border border-indigo-200"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
          
          <div className="px-4 py-1 text-xs opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatMessage = ({ message, currentUser, openPatientProfile }) => {
  // Check if it's a Swasthya Card message
  if (message.messageType === 'swasthyaCard') {
    return <SwasthyaCardMessage 
      message={message} 
      currentUser={currentUser} 
      openPatientProfile={openPatientProfile} 
    />;
  }
  
  // Check if it's a file or image message
  if (message.messageType === 'file' || message.messageType === 'image') {
    return <FileMessage 
      message={message} 
      currentUser={currentUser}
    />;
  }
  
  // Regular text message
  // Check if sender is an ID or an object
  const isCurrentUser = typeof message.sender === 'string' 
    ? message.sender === currentUser.id 
    : message.sender._id === currentUser.id;
  
  // Safely get sender name initial for avatar
  const getSenderInitial = () => {
    if (typeof message.sender === 'string') {
      return isCurrentUser ? currentUser.name.charAt(0) : '?';
    }
    return message.sender.name ? message.sender.name.charAt(0) : '?';
  };

  // Safely get sender name for alt text
  const getSenderName = () => {
    if (typeof message.sender === 'string') {
      return isCurrentUser ? currentUser.name : 'User';
    }
    return message.sender.name || 'User';
  };
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0 overflow-hidden shadow-md border border-indigo-200">
          {(typeof message.sender !== 'string' && message.sender.profileImage) ? (
            <img 
              src={message.sender.profileImage} 
              alt={getSenderName()} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold">
              {getSenderInitial()}
            </div>
          )}
        </div>
        
        <div className={`px-4 py-2 rounded-lg shadow-md ${
          isCurrentUser 
            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800'
        }`}>
          <div className="text-sm mb-1">
            {message.content}
          </div>
          <div className="text-xs opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [swasthyaCard, setSwasthyaCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  
  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await chatService.getUserChats();
        setChats(response.data.data.chats);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('Failed to load chat data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, []);
  
  // Fetch current chat when userId changes
  useEffect(() => {
    const fetchCurrentChat = async () => {
      if (!userId) {
        setCurrentChat(null);
        return;
      }
      
      try {
        setLoading(true);
        const response = await chatService.getChatWithUser(userId);
        setCurrentChat(response.data.data.chat);
        
        // Mark messages as read
        if (response.data.data.chat._id) {
          await chatService.markAsRead(response.data.data.chat._id);
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        toast.error('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentChat();
  }, [userId]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !currentChat?._id) return;
    
    try {
      setSendingMessage(true);
      const response = await chatService.sendMessage(currentChat._id, {
        content: message,
        messageType: 'text'
      });
      
      // Update the current chat with the new message
      setCurrentChat(response.data.data.chat);
      
      // Clear the message input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleChatSelect = (chat) => {
    const otherUserId = chat.participant._id;
    navigate(`/chat/${otherUserId}`);
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Toggle message options menu
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  // Fetch and share Swasthya card
  const handleShareSwasthyaCard = async () => {
    if (!currentChat?._id || user.role !== 'patient') {
      toast.error('Only patients can share Swasthya cards');
      return;
    }
    
    try {
      setLoadingCard(true);
      
      // Get the user's Swasthya card
      const response = await patientService.getSwasthyaCard();
      const cardData = response.data.data.swasthyaCard;
      
      // Share the card in the chat
      const chatResponse = await chatService.shareSwasthyaCard(
        currentChat._id, 
        user.id,
        cardData
      );
      
      // Update the chat with the new message
      setCurrentChat(chatResponse.data.data.chat);
      
      // Hide options menu
      setShowOptions(false);
      
      toast.success('Swasthya card shared successfully');
    } catch (error) {
      console.error('Error sharing Swasthya card:', error);
      toast.error('Failed to share Swasthya card');
    } finally {
      setLoadingCard(false);
    }
  };
  
  // Navigate to patient profile from card
  const openPatientProfile = (patientId) => {
    navigate(`/scan-patient/${patientId}`);
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowFilePreview(true);
      setShowOptions(false);
    }
  };
  
  // Cancel file upload
  const cancelFileUpload = () => {
    setSelectedFile(null);
    setShowFilePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  
  // Upload file
  const handleFileUpload = async () => {
    if (!selectedFile || !currentChat?._id) return;
    
    try {
      setUploadingFile(true);
      setUploadProgress(10); // Initial progress
      
      // Upload the file
      const response = await chatService.uploadFile(currentChat._id, selectedFile);
      setUploadProgress(70);
      
      // Get the file URL from response
      const { fileUrl, fileName } = response.data.data;
      
      // Determine file type (image or document)
      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(selectedFile.name);
      
      let chatResponse;
      if (isImage) {
        // Share as image
        chatResponse = await chatService.shareImage(
          currentChat._id,
          fileUrl,
          fileName || selectedFile.name
        );
      } else {
        // Share as document
        chatResponse = await chatService.shareDocument(
          currentChat._id,
          fileUrl,
          fileName || selectedFile.name
        );
      }
      
      setUploadProgress(100);
      
      // Update the chat with the new message
      setCurrentChat(chatResponse.data.data.chat);
      
      // Clear the file input
      cancelFileUpload();
      
      toast.success(`${isImage ? 'Image' : 'Document'} shared successfully`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };
  
  // Handle upload document action
  const handleUploadDocument = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowOptions(false);
  };
  
  if (loading && !chats.length) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-center md:text-left">Messages</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardTitle className="text-indigo-700">Contacts</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {chats.length > 0 ? (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`cursor-pointer rounded-md p-2 ${
                      userId === chat.participant._id ? 'bg-blue-100 shadow-sm border border-blue-200' : 'hover:bg-blue-50'
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{chat.participant.name}</p>
                      {chat.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-xs text-white">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    {chat.latestMessage && (
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-indigo-600 truncate max-w-32">
                          {chat.latestMessage.content}
                        </p>
                        <span className="text-xs text-indigo-500">
                          {formatTime(chat.latestMessage.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-indigo-600 py-4 bg-blue-50 rounded-lg border border-blue-100">No conversations yet</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300">
          {currentChat ? (
            <>
              <CardHeader className="border-b bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden shadow-md border border-indigo-200">
                    {currentChat.participants[0]._id === user.id 
                      ? (currentChat.participants[1].profileImage 
                        ? <img src={currentChat.participants[1].profileImage} alt={currentChat.participants[1].name} className="h-full w-full object-cover" />
                        : <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold">
                            {currentChat.participants[1].name.charAt(0)}
                          </div>)
                      : (currentChat.participants[0].profileImage 
                        ? <img src={currentChat.participants[0].profileImage} alt={currentChat.participants[0].name} className="h-full w-full object-cover" />
                        : <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold">
                            {currentChat.participants[0].name.charAt(0)}
                          </div>)
                    }
                  </div>
                  <CardTitle className="ml-2 text-indigo-700">
                    {currentChat.participants[0]._id === user.id 
                      ? currentChat.participants[1].name 
                      : currentChat.participants[0].name}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="h-96 overflow-y-auto p-6 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                {currentChat.messages.length > 0 ? (
                  <div>
                    {currentChat.messages.map((msg, index) => (
                      <ChatMessage 
                        key={index} 
                        message={msg} 
                        currentUser={user}
                        openPatientProfile={openPatientProfile}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-indigo-600 font-medium text-center bg-blue-50 px-6 py-3 rounded-lg border border-blue-100 shadow-sm">No messages yet. Send a message to start the conversation.</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                {showFilePreview && selectedFile ? (
                  // File preview before sending
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2 bg-blue-50 p-2 rounded-lg border border-blue-100 shadow-sm">
                      <div className="flex items-center">
                        {/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(selectedFile.name) ? (
                          <Image className="h-5 w-5 mr-2 text-indigo-600" />
                        ) : (
                          <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                        )}
                        <span className="text-sm truncate max-w-xs text-indigo-700">
                          {selectedFile.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={cancelFileUpload}
                          disabled={uploadingFile}
                          className="hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleFileUpload}
                          disabled={uploadingFile}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          {uploadingFile ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              {uploadProgress}%
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal message input
                  <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={toggleOptions}
                        className="p-2 rounded-full hover:bg-blue-100 focus:outline-none"
                      >
                        <MoreVertical className="h-5 w-5 text-indigo-600" />
                      </button>
                      
                      {showOptions && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white shadow-lg rounded-md border border-blue-100 overflow-hidden z-10">
                          <ul>
                            {user.role === 'patient' && (
                              <li>
                                <button
                                  type="button"
                                  className="flex w-full items-center px-4 py-2 text-sm hover:bg-blue-50 text-indigo-700"
                                  onClick={handleShareSwasthyaCard}
                                  disabled={loadingCard}
                                >
                                  <QrCode className="h-4 w-4 mr-2 text-indigo-600" />
                                  {loadingCard ? 'Sharing...' : 'Share Swasthya Card'}
                                </button>
                              </li>
                            )}
                            <li>
                              <button
                                type="button"
                                className="flex w-full items-center px-4 py-2 text-sm hover:bg-blue-50 text-indigo-700"
                                onClick={handleUploadDocument}
                              >
                                <FileUp className="h-4 w-4 mr-2 text-indigo-600" />
                                Upload File
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                className="flex w-full items-center px-4 py-2 text-sm hover:bg-blue-50 text-indigo-700"
                                onClick={handleUploadDocument}
                              >
                                <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                                Share Document
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 border border-blue-200 bg-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={sendingMessage}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      <span>Send</span>
                    </Button>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </form>
                )}
              </CardFooter>
            </>
          ) : (
            <div className="flex h-96 items-center justify-center">
              <p className="text-indigo-600 font-medium text-center bg-blue-50 px-6 py-3 rounded-lg border border-blue-100 shadow-sm">Select a contact to start chatting</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat; 