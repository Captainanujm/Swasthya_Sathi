import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { GradientButton } from '@/components/ui/gradient-button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import animations from '@/utils/animations';

const HeroSection = ({ darkMode, onDarkModeToggle }) => {
  const { user } = useAuth();
  
  // Wave animation for the background
  const waveVariant = {
    animate: {
      x: [0, -1000],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear",
        },
      },
    },
  };

  // Floating animation for the logo
  const floatAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 3,
          ease: "easeInOut",
        },
      },
    },
  };

  // User welcome animations
  const nameAnimation = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  // Tagline animation
  const taglineAnimation = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.5,
      },
    },
  };

  // Button animations
  const buttonAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.7,
      },
    },
  };

  return (
    <div className="relative bg-gradient-to-r from-[#78b842] to-[#0077a2] text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated waves */}
        <motion.div
          className="absolute inset-0 opacity-10"
          variants={waveVariant}
          animate="animate"
        >
          <svg
            width="2500"
            height="100%"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 25C166.667 25 166.667 75 333.333 75C500 75 500 25 666.667 25C833.333 25 833.333 75 1000 75C1166.67 75 1166.67 25 1333.33 25C1500 25 1500 75 1666.67 75C1833.33 75 1833.33 25 2000 25C2166.67 25 2166.67 75 2333.33 75C2500 75 2500 25 2666.67 25"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </motion.div>

        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 8 + 3,
              height: Math.random() * 8 + 3,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.15 + 0.05,
            }}
            animate={{
              y: [0, -(Math.random() * 100 + 50)],
              opacity: [Math.random() * 0.15 + 0.05, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Logo animation */}
          <motion.div
            className="md:w-1/3 mb-6 md:mb-0 flex justify-center"
            variants={animations.scaleIn}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            <motion.div
              className="relative"
              variants={floatAnimation}
              animate="animate"
            >
              <img
                src="/images/swasthya-sathi-logo.svg"
                alt="Swasthya Sathi Logo"
                className="h-48 w-auto relative z-10"
              />
              
              {/* Glow effect behind the logo */}
              <div className="absolute inset-0 bg-white opacity-20 blur-2xl rounded-full z-0 scale-90"></div>
            </motion.div>
          </motion.div>

          <div className="md:w-2/3 md:pl-12">
            {/* User welcome */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-sky-100"
              variants={nameAnimation}
              initial="hidden"
              animate="visible"
            >
              Welcome, {user?.name || 'Patient'}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-xl mb-8 text-sky-50"
              variants={taglineAnimation}
              initial="hidden"
              animate="visible"
            >
              Your comprehensive healthcare companion
            </motion.p>

            {/* Action buttons */}
            <motion.div
              className="flex flex-wrap gap-4 items-center"
              variants={buttonAnimation}
              initial="hidden"
              animate="visible"
            >
              <GradientButton
                variant="light"
                className="border border-white/20 backdrop-blur-sm"
                asChild
              >
                <Link to="/profile">View Your Profile</Link>
              </GradientButton>

              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-md backdrop-blur-sm">
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={onDarkModeToggle}
                />
                <Label htmlFor="dark-mode" className="text-white cursor-pointer">
                  Dark Mode
                </Label>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Curved separator */}
      <div className="absolute bottom-0 left-0 right-0 h-16">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fill={darkMode ? '#0f172a' : '#ffffff'}
            fillOpacity="1"
            d="M0,96L60,112C120,128,240,160,360,154.7C480,149,600,107,720,90.7C840,75,960,85,1080,96C1200,107,1320,117,1380,122.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection; 