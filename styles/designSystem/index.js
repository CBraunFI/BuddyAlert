// styles/designSystem/index.js
import { StyleSheet, Platform } from 'react-native';

/**
 * Color palette
 * (kept your existing values, added a few aliases used in screens)
 */
export const colors = {
  primary: '#4D5DFF',
  primaryDark: '#4338CA',      // ← used by NotificationScreen
  secondary: '#A23CFF',
  background: '#F9F9FB',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#666666',
  textSecondary: '#6B7280',    // ← alias commonly used in code
  alert: '#FFD700',
  danger: '#FF3B30',
  success: '#4CD964',
  onDanger: '#fff',
  onSuccess: '#fff',
  onAlert: '#000',
};

/**
 * Spacing scale
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

/**
 * Radii used across components
 */
export const radius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
};

/**
 * Simple cross‑platform elevation/shadow helper
 */
export const elevation = (level = 1) => {
  const android = { elevation: level };
  const ios = {
    shadowColor: '#000',
    shadowOpacity: Math.min(0.1 + level * 0.03, 0.3),
    shadowRadius: 1 + level * 1.5,
    shadowOffset: { width: 0, height: Math.ceil(level / 2) },
  };
  return Platform.OS === 'android' ? android : ios;
};

/**
 * Typography
 * (kept your sets, added "small" used across screens)
 */
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
  small: {
    // ← added for components using typography.small
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
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
    lineHeight: 20,
    color: '#fff',
    textAlign: 'center',
  },
});

/**
 * Optional button styles (kept from your file)
 */
export const buttons = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
});
