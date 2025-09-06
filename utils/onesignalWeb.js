// utils/onesignalWeb.js
import { Platform } from 'react-native';

// lädt das v16 SDK genau einmal
function loadSdkV16Once() {
  if (typeof window === 'undefined') return;
  if (window.__onesignal_v16_loaded__) return;

  // v16: Deferred-Queue verwenden
  window.OneSignalDeferred = window.OneSignalDeferred || [];

  const script = document.createElement('script');
  // v16 Script (page bundle) + defer
  script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  script.defer = true;
  document.head.appendChild(script);

  window.__onesignal_v16_loaded__ = true;
}

/**
 * Initialisiert OneSignal Web Push (nur Web).
 * Nutzt die v16-API + Deferred Queue.
 */
export function initOneSignalWeb({ appId }) {
  if (Platform.OS !== 'web') return;
  if (typeof window === 'undefined') return;

  loadSdkV16Once();

  // Alle Aufrufe in die Deferred-Queue legen – werden ausgeführt, sobald das SDK bereit ist.
  window.OneSignalDeferred.push(function (OneSignal) {
    // optional: Debug-Logs
    // OneSignal.Debug.setLogLevel('trace');

    OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true, // wichtig für http://localhost
      promptOptions: {
        // v16: Slidedown wird über "prompts" konfiguriert
        slidedown: {
          prompts: [
            {
              type: 'push',     // einfacher Push-Prompt (ohne Kategorien)
              autoPrompt: false // manuell auslösen
            }
          ]
        }
      }
    });
  });
}

/**
 * Zeigt den Slidedown-Push-Prompt an (v16).
 * Wir erzwingen ihn optional mit {force:true} für Tests.
 */
export function requestWebPushPermission() {
  if (Platform.OS !== 'web') return;
  if (typeof window === 'undefined') return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      // v16 Slidedown API
      await OneSignal.Slidedown.promptPush({ force: true });
    } catch (err) {
      console.warn('OneSignal Slidedown failed:', err?.message || err);
      // Fallback nur, wenn verfügbar (v16 stellt Notifications-API bereit)
      try {
        if (OneSignal?.Notifications?.requestPermission) {
          await OneSignal.Notifications.requestPermission();
        }
      } catch (e2) {
        console.warn('OneSignal requestPermission failed:', e2?.message || e2);
      }
    }
  });
}
