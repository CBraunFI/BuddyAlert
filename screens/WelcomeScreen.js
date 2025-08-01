import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { typography, colors, buttons, spacing } from '../styles/designSystem';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} // bitte das Logo als PNG ablegen
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={typography.h1}>BuddyAlert</Text>
      <Text style={[typography.body, styles.teaser]}>
        Dein solidarisches Sicherheitsnetz in der Nähe.
      </Text>

      <TouchableOpacity
        style={[buttons.primary, styles.button]}
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Text style={typography.button}>Alarm auslösen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('AboutScreen')}
      >
        <Text style={typography.caption}>Mehr erfahren</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },
  teaser: {
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.muted,
  },
  button: {
    width: '100%',
    marginBottom: spacing.md,
  },
  linkButton: {
    padding: spacing.sm,
  },
});
