import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Bereitschaftsstatus beim Laden wiederherstellen
    const loadAvailability = async () => {
      try {
        const value = await AsyncStorage.getItem('availability');
        if (value !== null) {
          setIsAvailable(JSON.parse(value));
        }
      } catch (e) {
        console.error("Fehler beim Laden des Bereitschaftsstatus", e);
      }
    };
    loadAvailability();
  }, []);

  const toggleAvailability = async () => {
    const newValue = !isAvailable;
    setIsAvailable(newValue);
    try {
      await AsyncStorage.setItem('availability', JSON.stringify(newValue));
    } catch (e) {
      console.error("Fehler beim Speichern des Bereitschaftsstatus", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Einstellungen</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Ich bin verfügbar für BuddyAlerts</Text>
        <Switch value={isAvailable} onValueChange={toggleAvailability} />
      </View>
      {isAvailable && (
        <Text style={styles.info}>Du bist Teil des aktiven Sicherheitsnetzes.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff'
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  label: {
    fontSize: 16
  },
  info: {
    marginTop: 20, fontSize: 16, color: 'green'
  }
});
