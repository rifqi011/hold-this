import { initializeApp } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence, indexedDBLocalPersistence } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Enable stronger persistence
Promise.all([
	setPersistence(auth, indexedDBLocalPersistence),
	enableIndexedDbPersistence(db, {
		synchronizeTabs: true,
	}),
]).catch((error) => {
	console.warn("Persistence error:", error)
	// Fallback to local persistence
	setPersistence(auth, browserLocalPersistence)
})
