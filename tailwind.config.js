/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFCFB',
          100: '#FBF9F5',
          200: '#F5F1E8',
          300: '#EBE5D8',
          400: '#D8CEBD',
          dark: '#121316',
          darkSurface: '#1B1D22',
          darkBorder: '#292C33',
        },
        clay: {
          light: '#FFF0EC',
          DEFAULT: '#E05A47',
          dark: '#B83F2E',
        },
        sage: {
          light: '#EDF5F1',
          DEFAULT: '#3E7B62',
          dark: '#2A5745',
        },
        solar: {
          light: '#FEF8EA',
          DEFAULT: '#E8982C',
          dark: '#B87216',
        },
        periwinkle: {
          light: '#EEEDFF',
          DEFAULT: '#635BFF',
          dark: '#483FE0',
        },
        ink: {
          DEFAULT: '#191816',
          muted: '#635F58',
          subtle: '#969085',
          border: '#E5DFD5',
        }
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Fraunces"', 'serif'],
      },
      boxShadow: {
        'sticker': '0 3px 0 0 rgba(0,0,0,0.12)',
        'polaroid': '0 8px 24px -4px rgba(25, 24, 22, 0.12), 0 2px 6px -1px rgba(25, 24, 22, 0.08)',
        'polaroid-lg': '0 16px 40px -8px rgba(25, 24, 22, 0.16), 0 4px 12px -2px rgba(25, 24, 22, 0.10)',
        'float': '0 20px 40px -12px rgba(25, 24, 22, 0.14)',
        'clay': '0 6px 0 0 #B83F2E',
        'soft': '0 2px 12px -2px rgba(25, 24, 22, 0.06)',
      },
      rotate: {
        'tilt-1': '1.2deg',
        '-tilt-1': '-1.2deg',
        'tilt-2': '2.5deg',
        '-tilt-2': '-2.5deg',
        'tilt-3': '3.8deg',
        '-tilt-3': '-3.8deg',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      },
      animation: {
        wiggle: 'wiggle 2.5s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        glow: 'pulseGlow 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
