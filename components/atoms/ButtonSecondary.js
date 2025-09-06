import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../styles/designSystem';

export default function ButtonSecondary({ title, onPress, style, textStyle, disabled, ...rest }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        elevation(2),
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
  enabled: { backgroundColor: '#F3F4F6' },
  disabled: { backgroundColor: '#E5E7EB' },
  text: { ...typography.body, color: colors.text, fontWeight: '600' },
});
