// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase } from 'firebase/database';
import { fb_apiKey, fb_authDomain, fb_databaseURL, fb_projectId, fb_storageBucket, fb_messagingSenderId, fb_appId, fb_measurementId } from './envConfig';


const firebaseConfig = {
    apiKey: fb_apiKey,
    authDomain: fb_authDomain,
    databaseURL: fb_databaseURL,
    projectId: fb_projectId,
    storageBucket: fb_storageBucket,
    messagingSenderId: fb_messagingSenderId,
    appId: fb_appId,
    measurementId: fb_measurementId
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const database = getDatabase(app);


export { auth, provider, signInWithPopup, database, getAuth };

