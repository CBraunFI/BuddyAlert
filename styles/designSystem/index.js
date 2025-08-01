import { StyleSheet } from 'react-native';

// Farbpalette (auf Basis deines Logos)
export const colors = {
  primary: '#4D5DFF', // leuchtendes Blau aus dem Logo
  secondary: '#A23CFF', // Violettton aus dem unteren Farbverlauf
  background: '#F9F9FB',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#666666',
  alert: '#FFD700',
  danger: '#FF3B30',
  success: '#4CD964',
};

// Typografie (Inter)
export const typography = StyleSheet.create({
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    lineHeight: 36,
    color: colors.text,
  },
  h2: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: colors.text,
  },
  h3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  button: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

// Spacing (Padding / Margin)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Buttons (Basis-Style)
export const buttons = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
});
