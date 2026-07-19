"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Analytics is optional and off unless explicitly enabled.
//
// A try/catch is not enough on its own: once getAnalytics() succeeds, the SDK
// fires its own Installations request in the background, and an invalid key
// makes that 400 on every page load with no way for us to catch it. So the
// switch has to be flipped before Firebase is initialised at all.
const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
const isConfigured = isEnabled && hasConfig;

let app: FirebaseApp | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

const getAnalyticsInstance = () => {
  if (typeof window === "undefined" || !isConfigured) return Promise.resolve(null);

  // Resolved once and reused; initialising per event re-registered the app on
  // every page view.
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      try {
        app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

        // False in unsupported browsers and whenever cookies are blocked.
        if (!(await isSupported())) return null;

        return getAnalytics(app);
      } catch (error) {
        console.warn("Firebase analytics disabled:", error);
        return null;
      }
    })();
  }

  return analyticsPromise;
};

const analyticsEvent = async (eventName: string, params?: Record<string, unknown>) => {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, params);
  } catch (error) {
    console.warn("Firebase logEvent failed:", error);
  }
};

export { getAnalyticsInstance, analyticsEvent, isConfigured as isAnalyticsConfigured };
