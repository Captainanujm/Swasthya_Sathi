import React, { useState, useEffect } from 'react';
import { postService } from '@/lib/api';
import { toast } from 'sonner';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else if (page === 1) {
        setLoading(true);
      }
      
      const response = await postService.getFeed({ page, limit: 5 });
      const { posts: newPosts, total, totalPages, currentPage } = response.data.data;
      
      if (refresh || page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setTotalPosts(total);
      setHasMore(currentPage < totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    setTotalPosts(prev => prev - 1);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-blue-100">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <Filter className="h-10 w-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Posts Yet</h3>
          <p className="text-gray-600 mb-4">
            You don't see any posts because you haven't followed any doctors yet, or your followed doctors haven't posted anything.
          </p>
          <Button 
            onClick={() => window.location.href = '/doctors'} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            Find and Follow Doctors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-700">
          Doctor Posts ({totalPosts})
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>
      
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard 
            key={post._id} 
            post={post} 
            onDelete={handleDeletePost}
            isOwner={false}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={handleLoadMore}
            disabled={loading && posts.length > 0}
          >
            {loading && posts.length > 0 ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                <span>Loading...</span>
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostFeed; 