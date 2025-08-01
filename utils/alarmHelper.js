// utils/alarmHelper.js

let navigationRef = null;

export const setAlarmNavigationRef = (ref) => {
  navigationRef = ref;
};

export const triggerAlarm = () => {
  if (navigationRef) {
    navigationRef.navigate('Alarm');
    // Hier kannst du später z. B. auch Push senden, Sound abspielen usw.
    console.log('[BuddyAlert] Alarm triggered.');
  } else {
    console.warn('[BuddyAlert] NavigationRef not set – cannot trigger alarm.');
  }
};
