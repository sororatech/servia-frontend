/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Point to your CSS variables
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        
        // You can even put status colors in globals.css too!
        success: 'var(--color-success, #10B981)', 
        warning: 'var(--color-warning, #F59E0B)',
        error: 'var(--color-error, #EF4444)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      // You can add spacing too!
      spacing: {
        'nav-height': '5rem', // 80px
      }
    },
  },
  plugins: [],
};