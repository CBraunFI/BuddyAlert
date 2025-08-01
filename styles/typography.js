import { StyleSheet } from 'react-native';

const typography = StyleSheet.create({
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    lineHeight: 36,
    color: '#1A1A1A',
  },
  h2: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: '#1A1A1A',
  },
  h3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 26,
    color: '#1A1A1A',
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#666',
  },
  button: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

export default typography;
