import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Trash, AlertTriangle } from 'lucide-react';
import { postService } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

const PostCard = ({ post, onDelete, isOwner }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [isDisliked, setIsDisliked] = useState(post.hasDisliked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes?.length || 0);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount || post.dislikes?.length || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get doctor name from post
  const doctorName = post.doctor?.name || 'Doctor';
  const doctorImage = post.doctor?.profileImage || '';

  // Format date
  const postDate = new Date(post.createdAt);
  const dateFormatted = formatDistanceToNow(postDate, { addSuffix: true });

  const handleLike = async () => {
    try {
      const response = await postService.likePost(post._id);
      
      // Toggle like status
      setIsLiked(response.data.data.liked);
      
      // If now liked and was disliked before, remove dislike
      if (response.data.data.liked && isDisliked) {
        setIsDisliked(false);
        setDislikesCount(prev => Math.max(0, prev - 1));
      }
      
      // Update likes count
      setLikesCount(prev => response.data.data.liked ? prev + 1 : Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleDislike = async () => {
    try {
      const response = await postService.dislikePost(post._id);
      
      // Toggle dislike status
      setIsDisliked(response.data.data.disliked);
      
      // If now disliked and was liked before, remove like
      if (response.data.data.disliked && isLiked) {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      }
      
      // Update dislikes count
      setDislikesCount(prev => response.data.data.disliked ? prev + 1 : Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error disliking post:', error);
      toast.error('Failed to dislike post');
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await postService.deletePost(post._id);
      toast.success('Post deleted successfully');
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pb-4 flex flex-row items-center space-x-4">
        <Avatar className="h-12 w-12 border border-blue-200">
          <AvatarImage src={doctorImage} alt={doctorName} />
          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            {doctorName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="text-md font-semibold text-indigo-700">Dr. {doctorName}</h3>
          <p className="text-xs text-gray-500">{dateFormatted}</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4">
          <p className="text-gray-700 mb-3">{post.caption}</p>
        </div>
        <div className="w-full overflow-hidden max-h-[400px]">
          <img 
            src={post.imageUrl} 
            alt="Health post" 
            className="w-full h-auto object-cover transition-transform hover:scale-105 duration-300" 
          />
        </div>
      </CardContent>
      
      {showDeleteConfirm ? (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center mb-2 text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h4 className="font-semibold">Delete Post?</h4>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            This action cannot be undone. This post will be permanently deleted.
          </p>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      ) : (
        <CardFooter className="flex justify-between items-center bg-gradient-to-r from-blue-500/5 to-indigo-500/5 p-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant={isLiked ? "default" : "outline"} 
              size="sm" 
              className={`flex items-center space-x-1 ${isLiked ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-indigo-100'}`}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likesCount}</span>
            </Button>
            
            <Button 
              variant={isDisliked ? "default" : "outline"} 
              size="sm" 
              className={`flex items-center space-x-1 ${isDisliked ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-indigo-100'}`}
              onClick={handleDislike}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{dislikesCount}</span>
            </Button>
          </div>
          
          {isOwner && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={confirmDelete}
            >
              <Trash className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default PostCard; 