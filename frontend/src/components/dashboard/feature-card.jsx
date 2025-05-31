import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';

const FeatureCard = ({ feature }) => {
  // Animation for the card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: feature.delay || 0
      }
    },
    hover: {
      y: -5,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    }
  };

  // Animation for the icon
  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15,
        delay: (feature.delay || 0) + 0.2
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        type: 'spring',
        stiffness: 800,
        damping: 15
      }
    }
  };

  // Animation for the text content
  const textVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: (feature.delay || 0) + 0.3
      }
    }
  };

  // Animation for the access now text
  const accessVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: (feature.delay || 0) + 0.4
      }
    },
    hover: {
      x: 5,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    }
  };

  // Animation for the arrow icon
  const arrowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: (feature.delay || 0) + 0.5
      }
    },
    hover: {
      x: 5,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="w-full h-full"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Link to={feature.path} className="block h-full">
        <AnimatedCard 
          className="h-full" 
          accent={true} 
          accentColor={feature.color}
          whileHover={false}
          whileTap={false}
        >
          <div className="flex flex-col md:flex-row p-6 h-full">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 flex items-center justify-center">
              <motion.div 
                className={`w-24 h-24 rounded-full flex items-center justify-center relative`}
                style={{ backgroundColor: `${feature.color}20` }}
                variants={iconVariants}
              >
                {/* Pulse effect behind the icon */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: `${feature.color}10` }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                <img 
                  src={feature.icon} 
                  alt={feature.title} 
                  className="w-20 h-20 object-contain feature-icon z-10 relative"
                />
              </motion.div>
            </div>
            
            <div className="flex-grow flex flex-col justify-center">
              <motion.div variants={textVariants}>
                <h3 className="text-xl font-semibold mb-2" style={{ color: feature.color }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
              </motion.div>
              
              <motion.div 
                className="mt-auto flex items-center"
                variants={accessVariants}
              >
                <span 
                  className="inline-flex items-center text-sm font-medium"
                  style={{ color: feature.color }}
                >
                  Access Now
                  <motion.svg 
                    className="ml-1 w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                    variants={arrowVariants}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </motion.svg>
                </span>
              </motion.div>
            </div>
          </div>
        </AnimatedCard>
      </Link>
    </motion.div>
  );
};

export default FeatureCard; 