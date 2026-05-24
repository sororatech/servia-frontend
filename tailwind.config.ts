/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/*/.{js,ts,jsx,tsx,mdx}',
    './src/components/*/.{js,ts,jsx,tsx,mdx}',
    './src/app/*/.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        
        success: 'var(--color-success, #10B981)', 
        warning: 'var(--color-warning, #F59E0B)',
        error: 'var(--color-error, #EF4444)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      spacing: {
        'nav-height': '5rem', 
      }
    },
  },
  plugins: [],
};