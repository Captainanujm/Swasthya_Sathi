import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { Card } from '@/components/ui/card';
import theme from '@/styles/theme';
import animations from '@/utils/animations';
import '../../../index.css';

// Dashboard components
import HeroSection from '@/components/dashboard/hero-section';
import FeatureCard from '@/components/dashboard/feature-card';
import StatCard from '@/components/dashboard/stat-card';
import FlipCard from '@/components/dashboard/flip-card';

// Logo and feature images
import logoImg from '/images/swasthya-sathi-logo.svg';
import medicalRecordImg from '/images/medical-record.svg';
import healthCardImg from '/images/health-card.svg';
import medicationImg from '/images/medication-reminder.svg';
import doctorsImg from '/images/doctors.svg';
import chatImg from '/images/doctor-chat.svg';
import postsImg from '/images/doctor-posts.svg';
import diseaseDetectionImg from '/images/disease-detection.svg';

const Dashboard = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Set the document title
    document.title = 'Dashboard | Swasthya Sathi';
    
    // Set theme colors for better UX
    document.documentElement.style.setProperty('--primary', theme.colors.primary.main);
    document.documentElement.style.setProperty('--secondary', theme.colors.secondary.main);
    
    // Check for user preference
    const savedDarkMode = localStorage.getItem('swasthya-dark-mode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
    
    return () => {
      // Clean up theme changes
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--secondary');
    };
  }, []);
  
  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('swasthya-dark-mode', darkMode);
  }, [darkMode]);
  
  // Toggle dark mode
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };
  
  // Feature cards data
  const features = [
    {
      id: 'medical-summary',
      title: 'Medical Summary',
      description: 'View and manage your medical records, test results and history',
      path: '/medical-summary',
      icon: medicalRecordImg,
      color: theme.colors.primary.main,
      delay: 0.1
    },
    {
      id: 'swasthya-card',
      title: 'Health ID Card',
      description: 'Access your digital health ID card with emergency contacts',
      path: '/swasthya-card',
      icon: healthCardImg,
      color: theme.colors.secondary.main,
      delay: 0.2
    },
    {
      id: 'disease-detection',
      title: 'Skin Disease Detection',
      description: 'AI-powered analysis of skin conditions with treatment recommendations',
      path: '/disease-detection',
      icon: diseaseDetectionImg,
      color: theme.colors.accent.amber,
      delay: 0.3,
      isNew: true
    },
    {
      id: 'care',
      title: 'Medication Reminders',
      description: 'Set and manage medication reminders with timely notifications',
      path: '/care',
      icon: medicationImg,
      color: theme.colors.primary.main,
      delay: 0.4
    },
    {
      id: 'doctors',
      title: 'Find Doctors',
      description: 'Search for healthcare providers by specialty and location',
      path: '/doctors',
      icon: doctorsImg,
      color: theme.colors.secondary.main,
      delay: 0.5
    },
    {
      id: 'posts',
      title: 'Doctor Posts',
      description: 'View health updates and information from doctors you follow',
      path: '/posts',
      icon: postsImg,
      color: theme.colors.primary.main,
      delay: 0.6
    },
    {
      id: 'chat',
      title: 'Doctor Consultations',
      description: 'Chat with your healthcare providers and get online consultations',
      path: '/chat',
      icon: chatImg,
      color: theme.colors.secondary.main,
      delay: 0.7
    }
  ];

  // Health stats data
  const healthStats = [
    {
      title: 'Medical Records',
      value: '5 Records',
      color: theme.colors.primary.main,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      delay: 0.1
    },
    {
      title: 'Doctor Consultations',
      value: '2 Upcoming',
      color: theme.colors.secondary.main,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      delay: 0.2
    },
    {
      title: 'Medication Reminders',
      value: '3 Active',
      color: theme.colors.accent.amber,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      delay: 0.3
    }
  ];

  // Quick actions data
  const quickActions = [
    {
      title: 'Add Reminder',
      to: '/care',
      description: 'Create and manage medication reminders with notifications',
      color: theme.colors.primary.main,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      delay: 0.1
    },
    {
      title: 'Find Doctor',
      to: '/doctors',
      description: 'Search for healthcare providers by specialty and location',
      color: theme.colors.secondary.main,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      delay: 0.2
    },
    {
      title: 'Detect Skin Disease',
      to: '/disease-detection',
      description: 'Use AI to analyze skin conditions and get recommendations',
      color: theme.colors.accent.amber,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      delay: 0.3,
      isNew: true
    },
    {
      title: 'Upload Record',
      to: '/medical-summary',
      description: 'Upload and store your medical records and test results',
      color: theme.colors.primary.main,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      delay: 0.4
    },
    {
      title: 'Chat with Doctor',
      to: '/chat',
      description: 'Connect directly with your healthcare provider through chat',
      color: theme.colors.secondary.main,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      delay: 0.5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 dashboard-container">
      {/* Hero Section with Logo */}
      <HeroSection darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} />
      
      {/* Main Features Section */}
      <motion.div 
        className="container mx-auto py-16 px-4"
        variants={animations.sectionReveal}
        initial="hidden"
        animate="visible"
        custom={0.3}
      >
        <motion.h2 
          className="text-3xl font-bold text-center mb-2 text-slate-800 dark:text-white"
          variants={animations.fadeInUp}
        >
          Your Health Services
        </motion.h2>
        
        <motion.p 
          className="text-center text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto"
          variants={animations.fadeInUp}
        >
          Access comprehensive healthcare tools designed to help you manage your health journey
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </motion.div>
      
      {/* Health Stats Summary */}
      <motion.div 
        className="container mx-auto py-12 px-4 mb-12"
        variants={animations.sectionReveal}
        initial="hidden"
        animate="visible"
        custom={0.8}
      >
        <Card className="bg-gradient-to-r from-sky-50 to-white dark:from-slate-800 dark:to-slate-700 border border-sky-100 dark:border-slate-600 shadow-md overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <rect width="50" height="50" fill="url(#smallGrid)" />
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="p-6 relative z-10">
            <motion.h3 
              className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-white"
              variants={animations.fadeInUp}
            >
              Your Health Overview
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {healthStats.map((stat, index) => (
                <StatCard 
                  key={index}
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  color={stat.color}
                  delay={stat.delay}
                />
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div 
        className="container mx-auto py-8 px-4 mb-16"
        variants={animations.sectionReveal}
        initial="hidden"
        animate="visible"
        custom={1.2}
      >
        <div className="bg-gradient-to-r from-[#0077a2]/5 to-[#78b842]/5 dark:from-[#0077a2]/20 dark:to-[#78b842]/20 rounded-lg p-8 backdrop-blur-sm">
          <motion.h3 
            className="text-xl font-semibold mb-8 text-center text-slate-800 dark:text-white"
            variants={animations.fadeInUp}
          >
            Quick Actions
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {quickActions.map((action, index) => (
              <FlipCard
                key={index}
                title={action.title}
                icon={action.icon}
                description={action.description}
                to={action.to}
                color={action.color}
                delay={action.delay}
              />
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Additional Resources */}
      <motion.div 
        className="container mx-auto py-8 px-4 mb-16"
        variants={animations.sectionReveal}
        initial="hidden"
        animate="visible"
        custom={1.6}
      >
        <Card className="bg-gradient-to-br from-[#0077a2]/5 via-white to-[#78b842]/5 dark:from-[#0077a2]/20 dark:via-slate-800 dark:to-[#78b842]/20 overflow-hidden relative p-8 border-0 shadow-xl">
          <div className="absolute inset-0 bg-white dark:bg-slate-800 opacity-70 backdrop-blur-md"></div>
          
          <div className="relative z-10">
            <motion.h3 
              className="text-2xl font-bold mb-4 text-center text-slate-800 dark:text-white"
              variants={animations.fadeInUp}
            >
              Health Tips & Resources
            </motion.h3>
            
            <motion.p 
              className="text-center text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto"
              variants={animations.fadeInUp}
              custom={0.1}
            >
              Stay informed with the latest health tips and resources
            </motion.p>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={animations.fadeInUp}
              custom={0.2}
            >
              <motion.div 
                className="p-4 bg-white dark:bg-slate-700 rounded-lg shadow-md"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Seasonal Health Updates</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">Get the latest information on seasonal health concerns and preventive measures.</p>
              </motion.div>
              
              <motion.div 
                className="p-4 bg-white dark:bg-slate-700 rounded-lg shadow-md"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Wellness Guides</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">Access comprehensive guides on nutrition, exercise, and mental well-being.</p>
              </motion.div>
              
              <motion.div 
                className="p-4 bg-white dark:bg-slate-700 rounded-lg shadow-md"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Medication Information</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">Learn about your medications, including usage instructions and potential side effects.</p>
              </motion.div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;