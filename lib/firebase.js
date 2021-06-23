import firebase from 'firebase/app'
import 'firebase/firestore'

export default function initFirebase() {
    const config = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
    
    return firebase.firestore();
}

export async function fetchAboutData() {
    let db = await initFirebase()
    let data = db.collection('about').limit(1)
        .get().then((snapshot) => {
            return snapshot.docs.map(doc => doc.data())
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

    return data;
}