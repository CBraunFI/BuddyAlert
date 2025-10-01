// screens/VerificationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors, typography } from '../styles/designSystem';
import {
  signInWithOAuth,
  checkRedirectResult,
  getVerifiedUser,
  type AuthProvider,
  type VerifiedUser,
} from '../services/auth';

interface VerificationScreenProps {
  navigation: any;
  onVerificationComplete?: (user: VerifiedUser) => void;
}

export default function VerificationScreen({ navigation, onVerificationComplete }: VerificationScreenProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [currentUser, setCurrentUser] = useState<VerifiedUser | null>(null);

  // Check for redirect result on mount
  useEffect(() => {
    checkForRedirect();
  }, []);

  // Check if user is already verified
  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const user = await getVerifiedUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async function checkForRedirect() {
    try {
      const user = await checkRedirectResult();
      if (user) {
        setCurrentUser(user);
        Alert.alert(
          t('verification.success'),
          t('verification.successMessage', { provider: user.provider })
        );
        if (onVerificationComplete) {
          onVerificationComplete(user);
        }
      }
    } catch (error: any) {
      console.error('Redirect result error:', error);
    } finally {
      setCheckingRedirect(false);
    }
  }

  async function handleOAuthSignIn(provider: AuthProvider) {
    try {
      setLoading(true);
      const user = await signInWithOAuth(provider);
      setCurrentUser(user);

      Alert.alert(
        t('verification.success'),
        t('verification.successMessage', { provider: user.provider })
      );

      if (onVerificationComplete) {
        onVerificationComplete(user);
      }

      // Navigate back or to home
      navigation.goBack();
    } catch (error: any) {
      if (error.message === 'REDIRECT_IN_PROGRESS') {
        // Redirect initiated, wait for result
        return;
      }

      console.error('OAuth error:', error);
      Alert.alert(
        t('verification.error'),
        error.message || t('errors.generic')
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingRedirect) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (currentUser) {
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.successCard}>
          <Text style={styles.successIcon}></Text>
          <Text style={styles.successTitle}>{t('verification.alreadyVerified')}</Text>
          <Text style={styles.successSubtitle}>
            {currentUser.displayName || currentUser.email}
          </Text>
          <Text style={styles.providerText}>
            {t('verification.verifiedWith')} {currentUser.provider}
          </Text>

          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.primaryButton]}
          >
            <Text style={styles.buttonText}>{t('common.close')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInUp.duration(600)} style={styles.title}>
        {t('verification.title')}
      </Animated.Text>

      <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.subtitle}>
        {t('verification.subtitle')}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.providerContainer}>
        <Pressable
          disabled={loading}
          onPress={() => handleOAuthSignIn('google')}
          style={[styles.providerButton, styles.googleButton, loading && styles.disabled]}
        >
          <Text style={styles.providerIcon}>G</Text>
          <Text style={styles.providerText}>
            {loading ? t('common.loading') : t('verification.continueWithGoogle')}
          </Text>
        </Pressable>

        <Pressable
          disabled={loading}
          onPress={() => handleOAuthSignIn('github')}
          style={[styles.providerButton, styles.githubButton, loading && styles.disabled]}
        >
          <Text style={styles.providerIcon}>¡</Text>
          <Text style={[styles.providerText, { color: '#fff' }]}>
            {loading ? t('common.loading') : t('verification.continueWithGithub')}
          </Text>
        </Pressable>

        <Pressable
          disabled={loading}
          onPress={() => handleOAuthSignIn('microsoft')}
          style={[styles.providerButton, styles.microsoftButton, loading && styles.disabled]}
        >
          <Text style={styles.providerIcon}>M</Text>
          <Text style={[styles.providerText, { color: '#fff' }]}>
            {loading ? t('common.loading') : t('verification.continueWithMicrosoft')}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.infoCard}>
        <Text style={styles.infoTitle}>{t('verification.whyVerify')}</Text>
        <Text style={styles.infoText}>{t('verification.whyVerifyText')}</Text>
      </Animated.View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 40,
  },
  providerContainer: {
    gap: 16,
    marginBottom: 40,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  githubButton: {
    backgroundColor: '#24292e',
    borderColor: '#24292e',
  },
  microsoftButton: {
    backgroundColor: '#00A4EF',
    borderColor: '#00A4EF',
  },
  providerIcon: {
    fontSize: 24,
    marginRight: 12,
    fontWeight: 'bold',
  },
  providerText: {
    ...typography.h3,
    color: colors.text,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...typography.h3,
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  infoTitle: {
    ...typography.h3,
    marginBottom: 8,
  },
  infoText: {
    ...typography.body,
    color: colors.muted,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: 16,
    color: colors.muted,
  },
  successCard: {
    backgroundColor: colors.surface,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  successIcon: {
    fontSize: 64,
    color: colors.success,
    marginBottom: 16,
  },
  successTitle: {
    ...typography.h1,
    marginBottom: 8,
  },
  successSubtitle: {
    ...typography.h3,
    color: colors.muted,
    marginBottom: 4,
  },
});