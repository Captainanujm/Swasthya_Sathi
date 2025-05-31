import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import DoctorPosts from '@/components/posts/DoctorPosts';

const Posts = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-center md:text-left">
        Health Posts
      </h1>
      
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        <p className="mb-6 text-gray-600">
          Share valuable health information, tips, and updates with your patients. All patients who follow you can see your posts.
        </p>
        
        <DoctorPosts />
      </div>
    </div>
  );
};

export default Posts; 