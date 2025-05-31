import theme from '../styles/theme';

// Animation variants for Framer Motion
export const animations = {
  // Fade in animations with different directions
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: theme.transitions.bezier
      } 
    }
  },
  
  fadeInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: theme.transitions.bezier
      } 
    }
  },
  
  fadeInDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: theme.transitions.bezier
      } 
    }
  },
  
  fadeInLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        ease: theme.transitions.bezier
      } 
    }
  },
  
  fadeInRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        ease: theme.transitions.bezier
      } 
    }
  },
  
  // Scale animations
  scaleIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1] // Custom spring-like ease
      } 
    }
  },
  
  scaleInFast: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1]
      } 
    }
  },
  
  // Container animations with staggered children
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  },
  
  containerFast: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.05
      }
    }
  },
  
  containerSlow: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  },

  // Item animations for child elements
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  },
  
  itemScale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  },
  
  // Hero-section special animations
  heroLeft: {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { 
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1]
      }
    }
  },
  
  heroRight: {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { 
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1]
      }
    }
  },
  
  // Page transitions
  pageEnter: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.3, 
        ease: "easeIn"
      }
    }
  },
  
  // Interactive animations
  hover: {
    scale: 1.03,
    transition: { duration: 0.2 }
  },
  
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 }
  },
  
  // Card animations
  cardHover: {
    rest: { 
      scale: 1,
      boxShadow: theme.shadows.md,
      transition: { 
        duration: 0.2, 
        ease: "easeOut"
      }
    },
    hover: { 
      scale: 1.03,
      boxShadow: theme.shadows.xl,
      transition: { 
        duration: 0.3, 
        ease: "easeOut"
      }
    }
  },
  
  // Button animations
  buttonScale: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  },
  
  // Loading animations
  pulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Dashboard section reveal animation
  sectionReveal: {
    hidden: { opacity: 0, y: 30 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    })
  }
};

// Animation hooks for common patterns
export const useAnimationVariants = () => {
  return animations;
};

export default animations; 