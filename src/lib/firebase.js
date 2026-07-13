import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import siteConfig from '@generated/docusaurus.config';

// Public by design: Firebase web config is not a secret — access to the
// `homeState` path is controlled by the Realtime Database security rules
// (see README/plan notes), not by hiding this object. apiKey/appId are
// still kept out of tracked source (env var → docusaurus.config.js
// customFields → here) to avoid secret-scanner noise and make rotation a
// one-line secret update instead of a commit; see .env.example.
const { firebaseApiKey, firebaseAppId } = siteConfig.customFields;

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "personal-website-abda6.firebaseapp.com",
  databaseURL: "https://personal-website-abda6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "personal-website-abda6",
  storageBucket: "personal-website-abda6.firebasestorage.app",
  messagingSenderId: "379533554295",
  appId: firebaseAppId,
  measurementId: "G-2MTZX2VEZJ"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const HOME_STATE_PATH = 'homeState';
