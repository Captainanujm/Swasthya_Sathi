import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '@/lib/api';

// Create context
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Load user data on initial load and token change
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          setLoading(true);
          const res = await authService.getCurrentUser();
          
          // Check if we have a stored profile image as backup
          const lastProfileImage = localStorage.getItem('lastProfileImage');
          let userData = res.data.data.user;
          
          // If user has no profile image but we have one stored in localStorage, use it
          if (!userData.profileImage && lastProfileImage) {
            console.log('Using profile image from localStorage');
            userData = {
              ...userData,
              profileImage: lastProfileImage
            };
            
            // Save the image to the server as well for persistence
            try {
              await authService.updateProfile({ profileImage: lastProfileImage });
            } catch (err) {
              console.error('Failed to persist stored profile image', err);
            }
          }
          
          setUser(userData);
          setError(null);
        } catch (error) {
          console.error('Error loading user', error);
          
          // Only clear token if we get an authentication error
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setError('Authentication failed. Please login again.');
          } else {
            setError('Could not load user data. Please try again later.');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await authService.login(email, password);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.data.user);
        toast.success('Login successful');

        // Redirect based on role and status
        if (res.data.data.user.role === 'doctor') {
          const profile = res.data.data.user.profile;
          if (profile && profile.approvalStatus === 'pending') {
            toast.info('Your doctor profile is pending approval');
            navigate('/doctor/pending');
          } else {
            navigate('/dashboard');
          }
        } else if (res.data.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/'); // Default for patients
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setError('Login failed. Please try again later.');
        toast.error('Login failed');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // If userData is passed as separate arguments instead of object
      if (typeof userData !== 'object') {
        // Support for legacy call structure (name, email, password, role, phoneNumber)
        const [name, email, password, role, phoneNumber] = arguments;
        userData = { name, email, password, role, phoneNumber };
      }
      
      // Ensure agreeToTerms is set
      if (userData.agreeToTerms === undefined) {
        userData.agreeToTerms = true; // Default for backward compatibility
      }
      
      const res = await authService.register(userData);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.data.user);
        toast.success('Registration successful');

        // Redirect based on role
        if (userData.role === 'doctor') {
          navigate('/doctor/create-profile');
        } else {
          navigate('/');
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error', error);
      
      if (error.response && error.response.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          // Handle validation errors
          const errorMessage = error.response.data.errors.map(err => err.msg).join(', ');
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (error.response.data.message) {
          setError(error.response.data.message);
          toast.error(error.response.data.message);
        } else {
          setError('Registration failed. Please try again later.');
          toast.error('Registration failed');
        }
      } else {
        setError('Registration failed. Please try again later.');
        toast.error('Registration failed');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
    navigate('/login');
  }, [navigate]);

  // Update user data (e.g. after profile update)
  const updateUser = useCallback((userData) => {
    setUser(prev => {
      const updatedUser = prev ? { ...prev, ...userData } : null;
      
      // If there's a profile image update, store it in localStorage
      if (updatedUser && userData.profileImage) {
        localStorage.setItem('lastProfileImage', userData.profileImage);
      }
      
      return updatedUser;
    });
  }, []);

  // Update password
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Password update error', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setError('Password update failed. Please try again later.');
        toast.error('Password update failed');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear any auth errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    updateUser,
    updatePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 