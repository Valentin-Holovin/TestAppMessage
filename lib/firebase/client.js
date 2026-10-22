import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export function getClientAuth() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value)) {
    throw new Error("Firebase is not configured. Add the Firebase settings to .env.local.");
  }
  return getAuth(getApps().length ? getApp() : initializeApp(config));
}

export function authError(error) {
  const messages = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-login-credentials": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/email-already-in-use": "This email is already registered. Please sign in.",
    "auth/weak-password": "Choose a stronger password (at least 6 characters).",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Connection failed. Please try again.",
    "auth/operation-not-allowed": "Enable Email/Password sign-in in Firebase Console.",
  };
  return messages[error.code] || (error.code ? "Authentication failed. Please try again." : error.message);
}

export async function authenticatedFetch(url, options = {}) {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("Please sign in to continue.");
  const token = await user.getIdToken();
  return fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
}
