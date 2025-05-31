import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Image, X, Upload } from 'lucide-react';
import { uploadImage } from '@/lib/cloudinary';
import { postService } from '@/lib/api';
import { toast } from 'sonner';

const PostForm = ({ onPostCreated }) => {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, JPG and PNG files are allowed');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('File size should not exceed 5MB');
      return;
    }
    
    setSelectedFile(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select an image to upload');
      return;
    }
    
    if (!caption.trim()) {
      toast.error('Please add a caption to your post');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setIsUploading(true);
      
      // Show fake progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Upload image to Cloudinary
      const imageUrl = await uploadImage(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Create post with the image URL
      const response = await postService.createPost({
        imageUrl,
        caption
      });
      
      // Reset form
      setCaption('');
      clearSelectedFile();
      setUploadProgress(0);
      
      // Call the callback if provided
      if (onPostCreated) {
        onPostCreated(response.data.data.post);
      }
      
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border border-blue-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <CardTitle className="text-indigo-700 text-xl">Create Health Post</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 space-y-4">
          <Textarea 
            placeholder="Share health tips, information or advice..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="resize-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
            required
          />
          
          {previewUrl ? (
            <div className="relative">
              <div className="w-full rounded-lg overflow-hidden border border-blue-100">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[300px] object-contain" 
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearSelectedFile}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors duration-200"
              onClick={() => document.getElementById('postImageInput').click()}
            >
              <Image className="h-10 w-10 text-indigo-500 mb-2" />
              <p className="text-indigo-600 font-medium">Click to select an image</p>
              <p className="text-gray-500 text-sm mt-1">JPEG, JPG or PNG, max 5MB</p>
            </div>
          )}
          
          <Input 
            id="postImageInput"
            type="file"
            accept="image/jpeg, image/jpg, image/png"
            onChange={handleFileChange}
            className="hidden"
            disabled={isSubmitting}
          />
          
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 p-4">
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center"
            disabled={isSubmitting || !selectedFile}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{isUploading ? 'Uploading...' : 'Posting...'}</span>
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                <span>Post to Your Followers</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PostForm; 