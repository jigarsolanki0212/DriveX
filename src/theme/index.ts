import { useColorScheme } from 'react-native';

export const colors = {
  primary: '#6366F1',       // indigo
  primaryDark: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  background: {
    light: '#F8FAFC',
    dark: '#0F172A'
  },
  card: {
    light: 'rgba(255,255,255,0.7)',
    dark: 'rgba(30,41,59,0.7)'
  },
  text: {
    primary: { light: '#0F172A', dark: '#F8FAFC' },
    secondary: { light: '#64748B', dark: '#94A3B8' }
  },
  border: {
    light: 'rgba(255,255,255,0.3)',
    dark: 'rgba(255,255,255,0.08)'
  }
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 9999
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '500', lineHeight: 18 }
} as const;

export const useTheme = () => {
  const isDark = useColorScheme() === 'dark';
  
  return {
    isDark,
    colors: {
      ...colors,
      background: isDark ? colors.background.dark : colors.background.light,
      card: isDark ? colors.card.dark : colors.card.light,
      text: {
        primary: isDark ? colors.text.primary.dark : colors.text.primary.light,
        secondary: isDark ? colors.text.secondary.dark : colors.text.secondary.light
      },
      border: isDark ? colors.border.dark : colors.border.light
    },
    spacing,
    radius,
    typography
  };
};
