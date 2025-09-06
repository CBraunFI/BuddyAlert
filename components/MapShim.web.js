// components/MapShim.web.js
import React from 'react';
import { View, Text } from 'react-native';

export default function MapShim({ region, alerts }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ textAlign: 'center', color: '#666' }}>
        Map-Vorschau ist im Web-MVP deaktiviert.
        {'\n'}Bitte in Expo Go (iOS/Android) öffnen.
      </Text>
    </View>
  );
}
