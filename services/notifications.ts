// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // Web uses OneSignal for notifications
    return true;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Trigger vibration pattern for alarm
 */
export async function triggerAlarmVibration(): Promise<void> {
  if (Platform.OS === 'web') {
    // Web vibration API
    if ('vibrate' in navigator) {
      // Strong vibration pattern: vibrate for 500ms, pause 200ms, repeat 3 times
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
    return;
  }

  try {
    // Mobile: Use Haptics for strong notification feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // Additional strong impact
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 200);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 400);
  } catch (error) {
    console.warn('Vibration failed:', error);
  }
}

/**
 * Play alarm sound
 */
export async function playAlarmSound(): Promise<void> {
  if (Platform.OS === 'web') {
    // Web: Use Web Audio API for beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Web audio playback failed:', error);
    }
    return;
  }

  // Mobile: Use Audio module
  try {
    // Create a simple beep using Audio
    // For a custom sound, replace with: require('../assets/alarm.mp3')
    const audioContext = await Audio.Sound.createAsync(
      { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ0fPTgjMGHm7A7OGVSgoQVa3n7q1aFgxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQxDm+DyvWgkBjiP0/PThDIGHG3A7OGVSwoQVK3n7q1aFQ==' },
      { shouldPlay: true, volume: 1.0 }
    );

    // Auto-unload after playing
    const { sound } = audioContext;
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Could not play alarm sound:', error);
    // Fallback: at least the notification sound will play
  }
}

/**
 * Send local notification for alarm trigger
 */
export async function sendAlarmNotification(options: {
  title: string;
  body: string;
  data?: any;
}): Promise<void> {
  if (Platform.OS === 'web') {
    // Web: Use browser Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: '/icon.png',
        badge: '/icon.png',
        requireInteraction: true,
        tag: 'buddyalert-alarm',
      });
      // Trigger vibration separately for web
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    }
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 500, 200, 500],
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.warn('Local notification failed:', error);
  }
}

/**
 * Trigger complete alarm experience: notification + vibration + sound
 */
export async function triggerAlarmAlert(options: {
  title: string;
  body: string;
  data?: any;
}): Promise<void> {
  try {
    // Execute all alerts in parallel for immediate feedback
    await Promise.all([
      sendAlarmNotification(options),
      triggerAlarmVibration(),
      playAlarmSound(),
    ]);
  } catch (error) {
    console.error('Alarm alert failed:', error);
  }
}

/**
 * Initialize notification service
 */
export async function initializeNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    // Web: Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    return;
  }

  // Mobile: Request permissions
  await requestNotificationPermissions();

  // Set audio mode for iOS
  if (Platform.OS === 'ios') {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
  }
}
