import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuickAction = ({ 
  icon, 
  label, 
  to, 
  color = '#0077a2',
  delay = 0,
  onClick 
}) => {
  // Button animation
  const buttonVariants = {
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
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    },
    tap: {
      y: 0,
      scale: 0.98,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 10
      }
    }
  };

  // Icon animation
  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15,
        delay: delay + 0.2
      }
    },
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: {
        type: 'spring',
        stiffness: 700,
        damping: 15
      }
    },
    tap: {
      scale: 0.95,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Label animation
  const labelVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: delay + 0.3
      }
    }
  };

  // Render either Link or button
  const content = (
    <>
      <motion.div 
        className="w-10 h-10 rounded-full flex items-center justify-center mb-2 relative"
        style={{ backgroundColor: `${color}10` }}
        variants={iconVariants}
      >
        {/* Background pulse effect */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ opacity: 0.05 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* The icon */}
        <div className="relative z-10" style={{ color }}>
          {icon}
        </div>
      </motion.div>
      
      <motion.span 
        className="text-sm text-gray-700 dark:text-gray-300 font-medium"
        variants={labelVariants}
      >
        {label}
      </motion.span>
    </>
  );

  return onClick ? (
    <motion.button
      className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
      onClick={onClick}
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      {content}
    </motion.button>
  ) : (
    <motion.div
      className="flex flex-col items-center"
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      <Link 
        to={to} 
        className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md w-full"
      >
        {content}
      </Link>
    </motion.div>
  );
};

export default QuickAction; 