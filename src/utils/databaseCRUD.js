import { ref, push, update, remove, get, set } from 'firebase/database';
import { database } from './firebaseConfig';


//Get user ref
export const getUserRef = (userId) => {
    try {
        return ref(database, `users/${userId}`);
    } catch (error) {
        console.error('Error getting user reference:', error);
    }
};

//Get all user widgets ref
export const getUserWidgetsRef = (userId) => {
    try {
        return ref(database, `users/${userId}/widgets`);
    } catch (error) {
        console.error('Error getting user\'s widgets reference:', error);
    }
    
};

//Get specific user widget ref
export const getUserWidgetRef = (userId, widgetId) => {
    try {
        return ref(database, `users/${userId}/widgets/${widgetId}`);
    } catch (error) {
        console.error('Error getting user\'s specific widget reference:', error);
    }
};

//Get specific user public widget ref
export const getUserPublicWidgetRef = (pageId, widgetId) => {
    try {
        return ref(database, `publicPages/${pageId}/widgets/${widgetId}`);
    } catch (error) {
        console.error('Error getting user\'s specific widget reference:', error);
    }
};

//Get all user public widgets ref
export const getUserPublicWidgetsRef = (pageId) => {
    try {
        return ref(database, `publicPages/${pageId}/widgets`);
    } catch (error) {
        console.error('Error getting user\'s widgets reference:', error);
    }
    
};

//Get user public pages id
export const getUserPublicPageId = (userId) => {
    try {
        return ref(database, `users/${userId}/publicPageId`);
    } catch (error) {
        console.error('Error getting user public page id:', error);
    }
};
export const getUserPublicPageRef = (pageId) => {
    try {
        return ref(database, `publicPages/${pageId}`);
    } catch (error) {
        console.error('Error getting user public page ref:', error);
    }
};

//Get public pages ref
export const getPublicPages = () => {
    try {
        return ref(database, `publicPages`);
    } catch (error) {
        console.error('Error getting public pages reference:', error);
    }
};

//Update data
export const updateData = (ref, updateObject) => {
    return update(ref, updateObject)
};

 //Get data
export const getData = (ref) => {
    return get(ref)
    .then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot; 
        } else {
            return null; 
        }
    })
    .catch((error) => {
        console.error('Error getting data from:', error);
    throw error; 
    });
};

//Set data
export const setData = (ref, data) => {
    return set(ref, data)
  };


//Push only to create ref
export const pushOnly = (ref) => {
    return push(ref)
        .then((newRef) => {
            return newRef; 
        })
        .catch((error) => console.error('Error pushing data:', error));
};

//Push data to ref
export const pushData = (ref, data) => {
    return push(ref, data)
        .then(() => console.log('Data successfully pushed'))
        .catch((error) => console.error('Error pushing data:', error));
};

//Remove ref
export const removeData = (ref) => {
    return remove(ref)
        .then(() => console.log('Data successfully removed'))
        .catch((error) => console.error('Error removing data:', error));
};