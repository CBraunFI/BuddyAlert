import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../styles/designSystem';

export default function ButtonPrimary({ title, onPress, style, textStyle, disabled, ...rest }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        elevation(3),
        disabled ? styles.disabled : styles.enabled,
        pressed && { opacity: 0.9 },
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  enabled: { backgroundColor: colors.primary },
  disabled: { backgroundColor: '#CBD5E1' },
  text: { ...typography.body, color: '#fff', fontWeight: '700' },
});
