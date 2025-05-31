import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './card';
import theme from '@/styles/theme';

const AnimatedCard = ({
  children,
  className = '',
  accent = false,
  accentColor = theme.colors.primary.main,
  whileHover = true,
  whileTap = true,
  variants,
  initial,
  animate,
  transition,
  ...props
}) => {
  // Default animation settings
  const defaultTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 20,
    duration: 0.3
  };

  // Combine hover and tap animations if enabled
  const interactionProps = {
    ...(whileHover && { 
      whileHover: { 
        scale: 1.02, 
        boxShadow: theme.shadows.lg,
        transition: defaultTransition
      } 
    }),
    ...(whileTap && { 
      whileTap: { 
        scale: 0.98, 
        boxShadow: theme.shadows.sm,
        transition: { duration: 0.1 } 
      } 
    })
  };

  // Accent border style
  const accentStyle = accent ? {
    borderLeft: `4px solid ${accentColor}`
  } : {};

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      variants={variants}
      initial={initial}
      animate={animate}
      transition={transition || defaultTransition}
      {...interactionProps}
      {...props}
    >
      <Card className="h-full" style={accentStyle}>
        {children}
      </Card>
    </motion.div>
  );
};

export { AnimatedCard }; 