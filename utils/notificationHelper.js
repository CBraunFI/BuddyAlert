import { Platform } from 'react-native';

export const initializeNotifications = () => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    console.log("Push notifications are only supported on native platforms.");
    return;
  }

  try {
    const OneSignal = require('react-native-onesignal').default;
    OneSignal.setAppId("28190a53-0cd4-403d-b9dd-99c8c1c7717c");
    OneSignal.setNotificationOpenedHandler(notification => {
      console.log("Notification opened:", notification);
    });
  } catch (e) {
    console.log("OneSignal not available in this environment.", e);
  }
};
