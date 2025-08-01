import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.alertText}>
        🟡 Jemand in deiner Nähe fühlt sich unwohl. Bitte sei aufmerksam.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff'
  },
  alertText: {
    fontSize: 20, color: '#d97e00', textAlign: 'center'
  }
});
