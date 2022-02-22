import { initializeApp } from "firebase/app";
import {
    getFirestore,
    query,
    orderBy,
    limit,
    where,
    onSnapshot,
    collection,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    doc,
    serverTimestamp,
    arrayUnion,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    appID: process.env.REACT_APP_FIREBASE_APP_ID,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const createEvent = (eventData, userId) => {
    const eventsColRef = collection(db, "events");
    return addDoc(eventsColRef, {
        created: serverTimestamp(),
        createdBy: userId,
        ...eventData,
    });
};

export const getEvent = (eventId) => {
    const eventDocRef = doc(db, "events", eventId);
    return getDoc(eventDocRef);
};

export const getEventId = (eventName) => {
    const q = query(
        collection(db, "events"),
        where("name", "==", eventName),
        limit(1)
    );
    return getDocs(q);
};

export const updateEvent = (eventId, eventData, userId) => {
    const eventDocRef = doc(db, "events", eventId);
    return updateDoc(eventDocRef, {
        ...eventData,
        edited: serverTimestamp(),
        editedBy: userId,
    });
};

export const getEventList = () => {
    const q = query(collection(db, "events"), orderBy("created", "desc"));
    return getDocs(q);
};
// a revoir complétement. id income = userId
export const saveIncome = (event, formData) => {
    const docRef = doc(
        collection(db, "events", event.id, "incomes"),
        formData.userId
    );
    return setDoc(docRef, {
        income: parseInt(formData.income),
        created: serverTimestamp(),
        createdBy: formData.userId,
    });
};

export const streamEvent = (eventId, snapshot, error) => {
    const eventsColRef = doc(db, "events", eventId);
    return onSnapshot(eventsColRef, snapshot, error);
};

export const streamIncome = (eventId, snapshot, error) => {
    const eventsColRef = collection(db, "events", eventId, "incomes");
    const q = query(eventsColRef, orderBy("created"));
    return onSnapshot(q, snapshot, error);
};

/* NEW REQUESTS SIMPLIFIED */

export const stream = (docId, collection, snapshot, error) => {
    const docRef = doc(db, collection, docId);
    return onSnapshot(docRef, snapshot, error);
};

export const getOnce = (docId, colRef) => {
    const docRef = doc(db, colRef, docId);
    return getDoc(docRef);
};

export const getOnceBy = (colRef, fieldName, fieldValue, max = 1) => {
    const q = query(
        collection(db, colRef),
        where(fieldName, "==", fieldValue),
        limit(max)
    );
    return getDocs(q);
};

export const update = (docId, colRef, data, userId) => {
    const docRef = doc(db, colRef, docId);
    return updateDoc(docRef, {
        ...data,
        edited: serverTimestamp(),
        editedBy: userId,
    });
};

export const write = (docId, colRef, data, userId) => {
    const docRef = doc(db, colRef, docId);
    return setDoc(docRef, {
        ...data,
        edited: serverTimestamp(),
        editedBy: userId,
    });
};

export const add = (colRef, data, userId) => {
    const docRef = collection(db, colRef);
    return addDoc(docRef, {
        created: serverTimestamp(),
        createdBy: userId,
        ...data,
    });
};

export const clear = (docId, colRef) => {
    return null;
};

// delete function to be created