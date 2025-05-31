import React from 'react';
import { motion } from 'framer-motion';
import theme from '@/styles/theme';

const StatCard = ({ 
  icon, 
  title, 
  value, 
  color = theme.colors.primary.main,
  delay = 0 
}) => {
  // Card animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay
      }
    },
    hover: {
      y: -5,
      boxShadow: theme.shadows.lg,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    }
  };

  // Icon animation
  const iconVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15,
        delay: delay + 0.1
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 700,
        damping: 15
      }
    }
  };

  // Content animation
  const contentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: delay + 0.2
      }
    }
  };

  // Value counter animation
  const countVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
        delay: delay + 0.3
      }
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-sky-100 dark:border-slate-700 shadow-sm"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="flex items-center">
        <motion.div 
          className="w-12 h-12 rounded-full flex items-center justify-center mr-4 relative"
          style={{ backgroundColor: `${color}15` }}
          variants={iconVariants}
        >
          {/* Subtle pulse animation */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color, opacity: 0.1 }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          {/* Icon */}
          {typeof icon === 'string' ? (
            <img src={icon} alt={title} className="h-6 w-6 z-10" />
          ) : (
            <div className="h-6 w-6 text-center z-10" style={{ color }}>
              {icon}
            </div>
          )}
        </motion.div>
        
        <motion.div variants={contentVariants}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
          <motion.p 
            className="text-xl font-bold"
            style={{ color }}
            variants={countVariants}
          >
            {value}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatCard; 