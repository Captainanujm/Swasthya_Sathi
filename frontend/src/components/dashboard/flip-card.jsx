import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import theme from '@/styles/theme';

const FlipCard = ({
  title,
  icon,
  description,
  to,
  color = theme.colors.primary.main,
  delay = 0,
  onClick
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

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
    },
    tap: {
      scale: 0.98,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 10
      }
    }
  };

  // Content animations
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { delay: delay + 0.2 }
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleActionButtonClick = (e) => {
    e.stopPropagation(); // Prevent the card flip
    
    if (onClick) {
      e.preventDefault();
      onClick();
    }
    // Otherwise let Link handle the navigation
  };

  return (
    <motion.div
      className="card-container mb-4"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      <div className="flip-card">
        <div 
          className={isFlipped ? "flip-card-inner flipped" : "flip-card-inner"} 
          onClick={handleCardClick}
        >
          {/* Front of card */}
          <div className="flip-card-front">
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div 
                className="w-full h-36 mb-2 relative flex items-center justify-center"
                style={{ backgroundColor: `${color}10` }}
              >
                {/* Common image for all cards */}
                <img 
                  src="/images/doco.png" 
                  alt={title} 
                  className="h-32 w-32 object-contain z-10"
                  draggable="false"
                />
                
                {/* Background pulse effect */}
                <motion.div 
                  className="absolute inset-0 rounded"
                  style={{ backgroundColor: color }}
                  initial={{ opacity: 0.05 }}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.05, 0.1, 0.05]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </div>
              
              <h3 
                className="text-base font-medium mt-2 text-center"
                style={{ color }}
              >
                {title}
              </h3>
              
              <div className="absolute bottom-2 right-2">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  style={{ color }}
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Back of card */}
          <div className="flip-card-back">
            <div className="h-full flex flex-col items-center justify-between p-4 text-center">
              <div
                className="flex flex-col items-center py-6 w-full"
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {icon}
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color }}
                >
                  {title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 px-2">
                  {description}
                </p>
              </div>
              
              <Link
                to={to}
                className="w-full py-2 px-4 text-sm rounded-md text-white font-semibold mb-4 transition-all hover:opacity-90 active:opacity-75 block text-center"
                style={{ backgroundColor: color }}
                onClick={handleActionButtonClick}
              >
                Access Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FlipCard; 