// Cloudinary configuration and helper functions
const CLOUDINARY_CLOUD_NAME = 'dloael0tt'; // Use your actual cloud name from CLOUDINARY_URL
const CLOUDINARY_UPLOAD_PRESET = 'goodone'; // Updated preset name for your app

/**
 * Uploads an image file to Cloudinary using unsigned upload
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    
    // Add a unique ID to the file name to prevent duplicate uploads
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    formData.append('public_id', `${file.name.split('.')[0]}-${uniqueId}`);
    
    // Set the resource_type based on file type
    const resourceType = file.type === 'application/pdf' ? 'raw' : 'image';
    
    // Make PDF files publicly accessible
    if (file.type === 'application/pdf') {
      formData.append('access_mode', 'public');
    }
    
    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      fileType: file.type,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      resourceType,
      uniqueId
    });
    
    // Try with specified preset first
    let response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
      mode: 'cors' // Explicitly set CORS mode
    });
    
    // If first attempt fails, try fallback presets
    if (!response.ok) {
      const fallbackPresets = ['ml_default', 'swasthya_upload', 'ml_upload'];
      
      for (const preset of fallbackPresets) {
        if (preset === CLOUDINARY_UPLOAD_PRESET) continue; // Skip if it's the one we already tried
        
        console.log(`Attempting with fallback preset: ${preset}`);
        formData.delete('upload_preset');
        formData.append('upload_preset', preset);
        
        response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
          method: 'POST',
          body: formData,
          mode: 'cors'
        });
        
        if (response.ok) break;
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary error:', errorData);
      throw new Error(errorData.error?.message || 'Image upload failed. Please try again later.');
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful:', data.secure_url);
    
    // For PDFs, ensure we're using a raw URL
    let finalUrl = data.secure_url;
    if (file.type === 'application/pdf') {
      // Store additional metadata for PDFs
      localStorage.setItem(`pdf_${data.public_id}`, JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
        uniqueId
      }));
    }
    
    // Store the URL in localStorage as a backup
    if (finalUrl) {
      localStorage.setItem('lastProfileImage', finalUrl);
    }
    
    // Return both the URL and the unique ID
    return finalUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // If we have a cached image URL, return it as fallback
    const cachedImage = localStorage.getItem('lastProfileImage');
    if (cachedImage && error.message !== 'Network Error') {
      console.log('Using cached image as fallback');
      return cachedImage;
    }
    
    throw error;
  }
};

/**
 * Creates a Cloudinary URL with specific transformations
 * @param {string} url - Original Cloudinary URL 
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed Cloudinary URL
 */
export const getTransformedUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'faces',
    quality = 'auto',
    fetchFormat = 'auto'
  } = options;

  // Split the URL at upload/
  const parts = url.split('upload/');
  if (parts.length !== 2) return url;

  // Build the transformation string
  let transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (fetchFormat) transformations.push(`f_${fetchFormat}`);
  
  const transformationString = transformations.join(',');
  
  // Return the transformed URL
  return `${parts[0]}upload/${transformationString}/${parts[1]}`;
}; 