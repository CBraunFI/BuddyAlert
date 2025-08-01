// screens/SupportScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support & Hilfe</Text>
      <Text style={styles.text}>
        Hier findest du demnächst Antworten auf häufige Fragen und Kontaktmöglichkeiten.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff'
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 12
  },
  text: {
    fontSize: 16, textAlign: 'center', color: '#333'
  }
});
