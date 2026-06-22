export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        card: '#141d2f',
        'card-hover': '#171b2b',
        primary: '#060815',
        'text-primary': '#f8fafc',
        'text-secondary': '#a1a1b5',
        accent: '#8b5cf6',
        'accent-hover': '#6366f1',
        border: '#272b3f',
        'border-light': '#383d5a',
        success: '#22c55e',
        error: '#f43f5e',
        'neon-purple': '#a07dda',
        'neon-blue': '#4f8cff',
        'neon-pink': '#d946ef',
      },
      boxShadow: {
        'btn-glow':
          'inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 18px rgba(139,92,246,0.18)',
        'btn-glow-hover':
          '0 0 24px rgba(139,92,246,0.28), 0 0 6px rgba(79,140,255,0.18)',
      },
    },
  },
  plugins: [],
}