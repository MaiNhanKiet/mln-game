import { theme } from './src/config/theme'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: theme.fontFamily,
      spacing: theme.spacing,
      borderRadius: theme.borderRadius,
      boxShadow: theme.boxShadow,
      transitionDuration: theme.animation,
    },
  },
  plugins: [],
}
