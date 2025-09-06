import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing, elevation } from '../../styles/designSystem';

export default function Card({ children, style, level = 3, ...rest }) {
  return (
    <View style={[styles.card, elevation(level), style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
});
