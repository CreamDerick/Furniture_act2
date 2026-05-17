export const COLORS = {
  // Theme core
  primary: '#FF1493', // Deep Pink / Luminous Pink (Vibrant Core)
  primaryLight: '#FF69B4', // Hot Pink / Light Rose
  primaryDark: '#C71585', // Deep Velvet Pink
  accent: '#FF2A85', // Electric Neon Pink (High Contrast Accent)
  accentHover: '#E01E70', // Accent hover
  
  // Backgrounds & Surface
  background: '#0D060F', // Obsidian dark base (subtle magenta undertone)
  cardBg: '#1A0F1E', // Dark rose-obsidian card surface
  modalBg: '#1E1123', // Deep pink-black for modals
  inputBg: '#25152C', // Deep magenta-black inputs
  
  // Borders
  border: '#3E1F46', // Muted rose borders
  borderActive: '#FF1493', // Active pink border
  
  // State colors
  success: '#10B981', // Emerald green
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  
  // Text Colors
  text: '#FFFFFF', // High-fidelity white
  textSecondary: '#E5C9E9', // Velvet Rose-Gray
  textPlaceholder: '#6D4675', // Muted purple-rose placeholders
  textContrast: '#0D060F', // Contrast text for buttons
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
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  accent: {
    shadowColor: '#FF2A85',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
};
