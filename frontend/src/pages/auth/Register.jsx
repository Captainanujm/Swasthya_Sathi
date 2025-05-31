import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { testConnection } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Check, X, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (password) => {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 2; // Has special char (more weight)
    
    // Normalize to 0-100
    return Math.min(Math.floor((score / 7) * 100), 100);
  };

  const strength = calculateStrength(password);
  
  const getStrengthLabel = () => {
    if (strength < 30) return { label: 'Weak', color: 'bg-red-500' };
    if (strength < 60) return { label: 'Fair', color: 'bg-yellow-500' };
    if (strength < 80) return { label: 'Good', color: 'bg-green-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };
  
  const { label, color } = getStrengthLabel();
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span>Password Strength</span>
        <span className="font-semibold">{label}</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { 
      label: 'At least 8 characters', 
      met: password.length >= 8,
    },
    { 
      label: 'Contains uppercase letter', 
      met: /[A-Z]/.test(password),
    },
    { 
      label: 'Contains lowercase letter', 
      met: /[a-z]/.test(password),
    },
    { 
      label: 'Contains a number', 
      met: /[0-9]/.test(password),
    },
    { 
      label: 'Contains special character', 
      met: /[^A-Za-z0-9]/.test(password),
    }
  ];
  
  return (
    <motion.div 
      className="mt-2 space-y-1"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Info size={12} />
        Password should meet the following criteria:
      </p>
      <ul className="text-xs grid grid-cols-2 gap-1">
        {criteria.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {item.met ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <X size={12} className="text-red-500" />
            )}
            <span className={item.met ? "text-green-700" : "text-muted-foreground"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'patient',
    agreeToTerms: false
  });
  
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [validationErrors, setValidationErrors] = useState({});
  const { register } = useAuth();
  
  // Form step (for multi-step form if needed)
  const [formStep, setFormStep] = useState(0);

  useEffect(() => {
    // Test backend connection on component mount
    const checkConnection = async () => {
      try {
        const result = await testConnection();
        setConnectionStatus(result ? 'connected' : 'failed');
      } catch (error) {
        setConnectionStatus('failed');
        console.error('Connection check error:', error);
      }
    };

    checkConnection();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // If field was previously touched, validate on change
    if (touched[name]) {
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };
  
  // Mark field as touched on blur and validate
  const handleBlur = (e) => {
    const { name, type, value, checked } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, type === 'checkbox' ? checked : value);
  };
  
  // Validate a single field
  const validateField = (fieldName, value) => {
    let errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors.name = 'Name should contain only letters and spaces';
        } else {
          delete errors.name;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
          errors.email = 'Please provide a valid email';
        } else {
          delete errors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(value)) {
          errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          errors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(value)) {
          errors.password = 'Password must contain at least one number';
        } else if (!/[^A-Za-z0-9]/.test(value)) {
          errors.password = 'Password must contain at least one special character';
        } else {
          delete errors.password;
        }
        
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
          } else {
            delete errors.confirmPassword;
          }
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
        
      case 'phoneNumber':
        if (value && !/^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value)) {
          errors.phoneNumber = 'Please enter a valid phone number';
        } else {
          delete errors.phoneNumber;
        }
        break;
        
      case 'agreeToTerms':
        if (!value) {
          errors.agreeToTerms = 'You must agree to the terms and conditions';
        } else {
          delete errors.agreeToTerms;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate the entire form
  const validateForm = () => {
    let isValid = true;
    
    // Touch all fields to show all errors
    const allTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate each field
    Object.keys(formData).forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      isValid = isValid && fieldIsValid;
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (connectionStatus === 'failed') {
      toast.error('Cannot register: Backend connection is not available');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
    } catch (error) {
      console.error('Registration error:', error);
      // Error handling is already done in API interceptors
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-primary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
            {connectionStatus === 'checking' && (
              <div className="text-sm text-yellow-600 flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-yellow-500 rounded-full border-t-transparent"></div>
                Checking connection to server...
              </div>
            )}
            {connectionStatus === 'failed' && (
              <div className="text-sm text-red-600 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                Cannot connect to server. Registration may not work.
              </div>
            )}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full rounded-md border ${touched.name && validationErrors.name ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm placeholder-muted-foreground`}
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.name && validationErrors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {validationErrors.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full rounded-md border ${touched.email && validationErrors.email ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm placeholder-muted-foreground`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.email && validationErrors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {validationErrors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full rounded-md border ${touched.password && validationErrors.password ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm placeholder-muted-foreground pr-10`}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {touched.password && validationErrors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {validationErrors.password}
                  </p>
                )}
                
                {formData.password && <PasswordStrengthMeter password={formData.password} />}
                {formData.password && <PasswordCriteria password={formData.password} />}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full rounded-md border ${touched.confirmPassword && validationErrors.confirmPassword ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm placeholder-muted-foreground pr-10`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {touched.confirmPassword && validationErrors.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1 (123) 456-7890"
                  className={`w-full rounded-md border ${touched.phoneNumber && validationErrors.phoneNumber ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm placeholder-muted-foreground`}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <p className="text-xs text-muted-foreground">Optional but recommended</p>
                {touched.phoneNumber && validationErrors.phoneNumber && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {validationErrors.phoneNumber}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Register as
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
                {formData.role === 'doctor' && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md flex items-start gap-2">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>As a doctor, you'll need to complete your profile with professional details and wait for admin approval before accessing all features.</span>
                  </p>
                )}
              </div>
              
              <div className="pt-2">
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    className={`h-4 w-4 rounded border ${touched.agreeToTerms && validationErrors.agreeToTerms ? 'border-red-500' : 'border-input'} text-primary focus:ring-primary mt-1`}
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {touched.agreeToTerms && validationErrors.agreeToTerms && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {validationErrors.agreeToTerms}
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || connectionStatus === 'checking'}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register; 