import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import PostFeed from '@/components/posts/PostFeed';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UsersRound } from 'lucide-react';

const Posts = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center flex-wrap mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Doctor Posts
        </h1>
        
        <Link to="/doctors">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 border-indigo-200"
          >
            <UsersRound className="h-4 w-4 text-indigo-600" />
            <span className="text-indigo-600">Find More Doctors</span>
          </Button>
        </Link>
      </div>
      
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100">
        <p className="text-gray-700">
          View health posts from doctors you follow. These posts may include health tips, medical information, and wellness advice to keep you informed.
        </p>
      </div>
      
      <PostFeed />
    </div>
  );
};

export default Posts; 