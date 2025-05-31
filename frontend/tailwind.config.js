import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: 'hsl(var(--foreground))',
            maxWidth: '65ch',
            '[class~="lead"]': {
              color: 'hsl(var(--muted-foreground))',
            },
            a: {
              color: 'hsl(var(--primary))',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'ol > li::marker': {
              color: 'hsl(var(--muted-foreground))',
            },
            'ul > li::marker': {
              color: 'hsl(var(--muted-foreground))',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
            },
            blockquote: {
              borderLeftColor: 'hsl(var(--primary))',
              color: 'hsl(var(--muted-foreground))',
            },
            h1: {
              color: 'hsl(var(--foreground))',
              fontWeight: '800',
            },
            h2: {
              color: 'hsl(var(--foreground))',
              fontWeight: '700',
            },
            h3: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            h4: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'figure figcaption': {
              color: 'hsl(var(--muted-foreground))',
            },
            code: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'a code': {
              color: 'hsl(var(--primary))',
            },
            pre: {
              backgroundColor: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
              borderRadius: 'var(--radius)',
              padding: '1em',
              overflowX: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
      colors: {
        swasthya: {
          blue: {
            DEFAULT: '#0077a2',
            light: '#3d96b9',
            dark: '#005c8c',
          },
          green: {
            DEFAULT: '#78b842',
            light: '#94c968',
            dark: '#5a8c32',
          },
          accent: {
            blue: '#4a9cff',
            teal: '#4ecdc4',
            purple: '#6c63ff',
            amber: '#ffbb38',
            rose: '#ff6b6b',
          }
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Healthcare specific colors
        doctor: {
          DEFAULT: "#0071c5",
          light: "#e6f3fa",
        },
        patient: {
          DEFAULT: "#00a86b",
          light: "#e6f7f0",
        },
        admin: {
          DEFAULT: "#8a2be2",
          light: "#f2e6fa",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { 
            transform: "scale(1)",
            opacity: "0.7",
          },
          "50%": { 
            transform: "scale(1.05)",
            opacity: "1",
          },
        },
        rotate: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 3s ease-in-out infinite",
        rotate: "rotate 10s linear infinite",
        "gradient-shift": "gradient-shift 10s ease-in-out infinite",
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(8px)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/hero-pattern.svg')",
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.primary.DEFAULT), 0 0 20px theme(colors.primary.DEFAULT)',
        'neon-secondary': '0 0 5px theme(colors.secondary.DEFAULT), 0 0 20px theme(colors.secondary.DEFAULT)'
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addComponents }) {
      addComponents({
        '.prose': {
          '@apply max-w-none text-foreground': {},
          'h1, h2, h3, h4, h5, h6': {
            '@apply font-bold my-4 text-foreground': {},
          },
          'h1': {
            '@apply text-3xl mt-8 mb-4': {},
          },
          'h2': {
            '@apply text-2xl mt-8 mb-3': {},
          },
          'h3': {
            '@apply text-xl mt-6 mb-3': {},
          },
          'p': {
            '@apply my-4 leading-relaxed': {},
          },
          'ul, ol': {
            '@apply my-6 ml-6': {},
          },
          'ul': {
            '@apply list-disc': {},
          },
          'ol': {
            '@apply list-decimal': {},
          },
          'li': {
            '@apply my-2': {},
          },
          'a': {
            '@apply text-primary hover:underline': {},
          },
          'blockquote': {
            '@apply border-l-4 border-primary pl-4 my-6 italic text-muted-foreground': {},
          },
          'hr': {
            '@apply my-8 border-border': {},
          },
          'table': {
            '@apply w-full my-6 border-collapse': {},
          },
          'table th': {
            '@apply p-2 bg-muted border border-border text-left font-semibold': {},
          },
          'table td': {
            '@apply p-2 border border-border': {},
          },
          'code': {
            '@apply bg-muted text-primary px-1 py-0.5 rounded': {},
          },
          'pre': {
            '@apply bg-muted p-4 rounded overflow-x-auto my-6': {},
          },
          'pre code': {
            '@apply bg-transparent p-0': {},
          },
          'figure': {
            '@apply my-6': {},
          },
          'img': {
            '@apply max-w-full my-6 rounded': {},
          },
          '.prose-lg': {
            '@apply text-lg': {},
            'p': {
              '@apply my-5': {},
            },
            'h1, h2, h3, h4, h5, h6': {
              '@apply my-6': {},
            },
          },
        },
      });
    },
  ],
};

export default config; 