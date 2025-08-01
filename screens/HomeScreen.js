import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 Minuten
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    let timer;
    if (isAlertActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsAlertActive(false);
      setTimeLeft(15 * 60);
    }
    return () => clearInterval(timer);
  }, [isAlertActive, timeLeft]);

  const toggleAlert = () => {
    if (isAlertActive) {
      setIsAlertActive(false);
      setTimeLeft(15 * 60);
    } else {
      setIsAlertActive(true);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;

  };

  // Simuliertes Geo-Notification-Polling
  useEffect(() => {
    const pollNearbyAlerts = setInterval(() => {
      if (!isAlertActive && isAvailable) {
        const simulatedAlert = Math.random() < 0.2; // 20% Chance
        if (simulatedAlert) {
          navigation.navigate('Notification');
        }
      }
    }, 15000); // alle 15 Sekunden prüfen
    return () => clearInterval(pollNearbyAlerts);
  }, [isAvailable, isAlertActive]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BuddyAlert</Text>
      <Text style={styles.subtitle}>
        {isAlertActive ? "Signal aktiv – du bist verbunden" : "Drücke den Button, wenn du dich unwohl fühlst"}
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isAlertActive ? styles.buttonActive : styles.buttonInactive,
          pressed && { opacity: 0.8 }
        ]}
        onPress={toggleAlert}
      >
        <Text style={styles.buttonText}>
          {isAlertActive ? "ALARM BEENDEN" : "BUDDYALERT AKTIVIEREN"}
        </Text>
      </Pressable>

      {isAlertActive && (
        <Text style={styles.timer}>Noch {formatTime(timeLeft)} Minuten</Text>
      )}

      <View style={styles.menu}>
        <Button title="Einstellungen" onPress={() => navigation.navigate('SettingsScreen')} />
        <Button title="Notification-Test" onPress={() => navigation.navigate('NotificationScreen')} />
      </View>

      <Text style={styles.status}>
        Bereitschaft: {isAvailable ? "Aktiv" : "Inaktiv"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff'
  },
  title: {
    fontSize: 28, fontWeight: 'bold', marginBottom: 10
  },
  subtitle: {
    fontSize: 16, textAlign: 'center', marginBottom: 30
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 100,
    elevation: 3
  },
  buttonInactive: {
    backgroundColor: '#4a90e2'
  },
  buttonActive: {
    backgroundColor: '#d0021b'
  },
  buttonText: {
    color: '#fff', fontSize: 16, fontWeight: 'bold'
  },
  timer: {
    marginTop: 20,
    fontSize: 16,
    color: '#333'
  },
  menu: {
    marginTop: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  status: {
    marginTop: 30,
    fontSize: 16,
    color: '#666'
  }
});
