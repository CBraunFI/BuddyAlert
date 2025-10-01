// services/geo.ts
import {
  geohashForLocation,
  geohashQueryBounds,
  distanceBetween,
} from 'geofire-common';

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Creates a geohash for given coordinates
 */
export function makeGeohash(lat: number, lng: number): string {
  return geohashForLocation([lat, lng]);
}

/**
 * Creates geohash bounds for radius query
 * @param lat Latitude
 * @param lng Longitude
 * @param radiusInM Radius in meters (default: 500)
 */
export function makeGeoBounds(lat: number, lng: number, radiusInM: number = 500): string[] {
  return geohashQueryBounds([lat, lng], radiusInM);
}

/**
 * Calculates Haversine distance in meters between two points
 */
export function distanceM(a: Coordinates, b: Coordinates): number {
  return distanceBetween([a.lat, a.lng], [b.lat, b.lng]) * 1000;
}
