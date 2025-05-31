// Theme configuration for Swasthya Sathi
const theme = {
  colors: {
    // Primary colors
    primary: {
      main: '#0077a2',
      light: '#3d96b9',
      dark: '#005c8c',
      contrastText: '#ffffff'
    },
    // Secondary colors
    secondary: {
      main: '#78b842',
      light: '#94c968',
      dark: '#5a8c32',
      contrastText: '#ffffff'
    },
    // Accent colors for highlights and special elements
    accent: {
      blue: '#4a9cff',
      teal: '#4ecdc4',
      purple: '#6c63ff',
      amber: '#ffbb38',
      rose: '#ff6b6b'
    },
    // Semantic colors for feedback
    semantic: {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3'
    },
    // Neutral colors for backgrounds and text
    neutral: {
      background: {
        light: '#f8fafc',
        main: '#f1f5f9',
        dark: '#0f172a'
      },
      card: {
        light: '#ffffff',
        dark: '#1e293b'
      },
      text: {
        light: {
          primary: '#1e293b',
          secondary: '#64748b',
          disabled: '#94a3b8'
        },
        dark: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          disabled: '#64748b'
        }
      },
      divider: {
        light: '#e2e8f0',
        dark: '#334155'
      }
    }
  },
  // Rounded corner values
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px'
  },
  // Shadow values for elevation
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
  },
  // Animation timing
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    hero: '700ms',
    bezier: 'cubic-bezier(0.65, 0, 0.35, 1)'
  }
};

export default theme; 