/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MFO Brand Colors (Seattle Seahawks palette)
        navy: {
          DEFAULT: '#002244',
          50: '#e6eef5',
          100: '#ccdcea',
          200: '#99b9d5',
          300: '#6696c0',
          400: '#3373ab',
          500: '#002244',
          600: '#001b36',
          700: '#001429',
          800: '#000e1b',
          900: '#00070e',
        },
        action: {
          DEFAULT: '#69BE28',
          50: '#f0f9e8',
          100: '#e1f3d1',
          200: '#c3e7a3',
          300: '#a5db75',
          400: '#87cf47',
          500: '#69BE28',
          600: '#549820',
          700: '#3f7218',
          800: '#2a4c10',
          900: '#152608',
        },
        wolf: {
          DEFAULT: '#A5ACAF',
          50: '#f5f6f6',
          100: '#ebeced',
          200: '#d7d9db',
          300: '#c3c7c9',
          400: '#afb4b7',
          500: '#A5ACAF',
          600: '#848a8c',
          700: '#636769',
          800: '#424546',
          900: '#212223',
        },
        // Semantic colors
        success: '#69BE28',
        warning: '#FFC107',
        danger: '#DC3545',
        info: '#17A2B8',
      },
      fontFamily: {
        display: ['Oswald', 'system-ui', 'sans-serif'],
        body: ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 34, 68, 0.1)',
        'card-hover': '0 4px 8px rgba(0, 34, 68, 0.15)',
      },
      spacing: {
        'touch': '48px', // Minimum touch target size
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
