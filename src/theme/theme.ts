export const COLORS = {
  // Theme core
  primary: '#8A2BE2', // Amethyst Purple (Vibrant)
  primaryLight: '#B19FFB', // Light Lavender
  primaryDark: '#5E1B9A', // Deep Purple
  accent: '#FFB300', // Champagne Gold / Luminous Amber (High Contrast Accent)
  accentHover: '#E5A100', // Gold hover
  
  // Backgrounds & Surface
  background: '#0D0814', // obsidian dark base
  cardBg: '#171121', // Dark violet-gray card surface
  modalBg: '#1B1426', // Deep purple-black for modals
  inputBg: '#21182E', // Deep input background
  
  // Borders
  border: '#322547', // Muted purple borders
  borderActive: '#8A2BE2', // Active border
  
  // State colors
  success: '#10B981', // Emerald green
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  
  // Text Colors
  text: '#FFFFFF', // High-fidelity white
  textSecondary: '#AFA8BA', // Muted Lavender-Gray
  textPlaceholder: '#5D5370', // Darker gray for placeholders
  textContrast: '#0D0814', // Contrast text for gold/white buttons
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  body: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textPlaceholder,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const SHADOWS = {
  premium: {
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  accent: {
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
};
