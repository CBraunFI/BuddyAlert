import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/designSystem';

export default function PaginationDots({ count, activeIndex = 0, size = 8, gap = spacing.xs }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginHorizontal: gap / 2, // nur hier!
            },
            i === activeIndex ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  active: { backgroundColor: colors.primary },
  inactive: { backgroundColor: '#E5E7EB' },
  dot: {},
});
