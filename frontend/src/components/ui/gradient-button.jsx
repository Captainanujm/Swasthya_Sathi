import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import theme from '@/styles/theme';

const GradientButton = ({
  children,
  className = '',
  variant = 'primary',
  size = 'default',
  disabled = false,
  asChild = false,
  onClick,
  ...props
}) => {
  // Define gradient styles based on variant
  const gradients = {
    primary: 'from-[#0077a2] to-[#005c8c]',
    secondary: 'from-[#78b842] to-[#5a8c32]',
    accent: 'from-[#4a9cff] to-[#2c6cb9]',
    success: 'from-[#4caf50] to-[#388e3c]',
    warning: 'from-[#ff9800] to-[#f57c00]',
    danger: 'from-[#f44336] to-[#d32f2f]',
    info: 'from-[#2196f3] to-[#1976d2]',
    dark: 'from-[#37474f] to-[#263238]',
    light: 'from-[#f5f5f5] to-[#e0e0e0] text-gray-800',
    outline: 'bg-transparent border-2 border-current',
    glass: 'bg-opacity-20 backdrop-filter backdrop-blur-md border border-white/30',
  };

  // Define size styles
  const sizes = {
    sm: 'py-1 px-3 text-sm',
    default: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
    xl: 'py-4 px-8 text-xl',
  };

  // Animation properties
  const buttonVariants = {
    initial: { 
      scale: 1,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    hover: { 
      scale: 1.03,
      boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.97,
      boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)',
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 10
      }
    },
    disabled: {
      opacity: 0.6,
      scale: 1,
      boxShadow: 'none'
    }
  };

  // Base styles
  const baseClasses = 'relative inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Text color for gradient buttons
  const textColorClass = variant === 'light' ? 'text-gray-800' : 'text-white';

  // Generate complete class string
  const buttonClasses = cn(
    baseClasses,
    gradients[variant],
    sizes[size],
    textColorClass,
    variant === 'outline' ? 'text-current' : '',
    variant !== 'outline' && variant !== 'glass' ? 'bg-gradient-to-r' : '',
    disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
    className
  );

  // Use motion button or let consumer provide their own component
  const Component = motion.button;

  return (
    <Component
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled ? "disabled" : "hover"}
      whileTap={disabled ? "disabled" : "tap"}
      animate={disabled ? "disabled" : "initial"}
      {...props}
    >
      {/* Subtle shine effect overlay */}
      {variant !== 'outline' && variant !== 'glass' && !disabled && (
        <span className="absolute inset-0 overflow-hidden rounded-md">
          <span className="absolute -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent top-0 inset-0"></span>
        </span>
      )}
      
      {children}
    </Component>
  );
};

export { GradientButton }; 