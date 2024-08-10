const apiUrl = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_PROD_URL : process.env.REACT_APP_API_DEV_URL;

const fb_apiKey = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_FB_API_KEY : process.env.REACT_APP_DEV_FB_API_KEY;
const fb_authDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_FB_AUTH_DOMAIN : process.env.REACT_APP_DEV_FB_AUTH_DOMAIN;
const fb_databaseURL = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_FB_DATABASE_URL : process.env.REACT_APP_DEV_FB_DATABASE_URL;
const fb_projectId = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_FB_PROJECT_ID : process.env.REACT_APP_DEV_FB_PROJECT_ID;
const fb_storageBucket = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_FB_STORAGE_BUCKET : process.env.REACT_APP_DEV_FB_STORAGE_BUCKET;
const fb_messagingSenderId = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_FB_MESSAGING_SENDER_ID : process.env.REACT_APP_DEV_FB_MESSAGING_SENDER_ID;
const fb_appId = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_FB_APP_ID : process.env.REACT_APP_DEV_FB_APP_ID;
const fb_measurementId = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_FB_MEASUREMENT_ID : process.env.REACT_APP_DEV_FB_MEASUREMENT_ID;



export {
    apiUrl, fb_apiKey, fb_authDomain, fb_databaseURL, fb_projectId, fb_storageBucket, fb_messagingSenderId, fb_appId, fb_measurementId
};