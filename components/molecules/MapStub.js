import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius, elevation } from '../../styles/designSystem';

export default function MapStub({ height = 140, children, style }) {
  return (
    <View style={[styles.box, { height }, elevation(1), style]}>
      {children ?? <Text style={styles.text}>Karte (Platzhalter)</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  text: { ...typography.small, color: colors.textSecondary },
});
