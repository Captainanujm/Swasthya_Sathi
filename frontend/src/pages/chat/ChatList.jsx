import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { chatService } from '@/lib/api';
import { toast } from 'sonner';

const ChatListItem = ({ chat, currentUser }) => {
  // Find the other participant (not the current user)
  const otherParticipant = chat.participants.find(
    p => p._id !== currentUser.id
  );
  
  // Get the last message
  const lastMessage = chat.messages.length > 0 
    ? chat.messages[chat.messages.length - 1] 
    : null;
  
  // Check if there are unread messages
  const hasUnreadMessages = chat.messages.some(
    msg => !msg.readBy.includes(currentUser.id) && msg.sender._id !== currentUser.id
  );
  
  // Format the time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If the message is from today, show only the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the message is from this week, show the day name
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show the date
    return date.toLocaleDateString();
  };

  return (
    <Link to={`/chat/${chat._id}`} className="block">
      <div className={`p-4 hover:bg-blue-50 rounded-lg transition-colors ${hasUnreadMessages ? 'bg-blue-100/30' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden shadow-md border border-indigo-200">
            {otherParticipant?.profileImage ? (
              <img 
                src={otherParticipant.profileImage} 
                alt={otherParticipant.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-bold">
                {otherParticipant?.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className={`font-medium truncate text-gray-800 ${hasUnreadMessages ? 'font-semibold' : ''}`}>
                {otherParticipant?.name}
              </h3>
              {lastMessage && (
                <span className="text-xs text-indigo-600">
                  {formatTime(lastMessage.createdAt)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <p className={`text-sm truncate ${hasUnreadMessages ? 'font-medium text-indigo-700' : 'text-indigo-600'}`}>
                {lastMessage ? lastMessage.content : 'No messages yet'}
              </p>
              
              {hasUnreadMessages && (
                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-600"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await chatService.getUserChats();
        setChats(response.data.data.chats);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load chats. Please try again later.');
        toast.error('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
    
    // Set up polling for new messages (in a real app, use socket.io instead)
    const interval = setInterval(fetchChats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-center md:text-left">Messages</h1>
      
      <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <CardTitle className="text-indigo-700">Your Conversations</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12 font-medium">{error}</div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 mx-4">
              <p className="text-lg text-indigo-600 font-medium">You don't have any chats yet.</p>
              {user?.role === 'patient' && (
                <Button 
                  onClick={() => navigate('/doctors')}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Find Doctors
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {chats.map(chat => (
                <ChatListItem 
                  key={chat._id} 
                  chat={chat} 
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatListPage; 