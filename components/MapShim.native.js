// components/MapShim.native.js
import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

export default function MapShim({ region, alerts }) {
  if (!region) {
    return null;
  }
  return (
    <MapView style={StyleSheet.absoluteFill} initialRegion={region}>
      {alerts.map((a) => (
        <Marker
          key={a.id}
          coordinate={{ latitude: a.lat, longitude: a.lng }}
          title={a.visibility === 'verified' ? 'Verified' : 'Public'}
          description={a.status ?? 'active'}
          pinColor={a.visibility === 'verified' ? '#A23CFF' : '#4D5DFF'}
        />
      ))}
    </MapView>
  );
}
