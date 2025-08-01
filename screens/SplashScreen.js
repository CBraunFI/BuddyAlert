import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('WelcomeScreen');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>BuddyAlert</Text>
      <ActivityIndicator size="large" color="#4a90e2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  logo: {
    fontSize: 32, fontWeight: 'bold', marginBottom: 20
  }
});
