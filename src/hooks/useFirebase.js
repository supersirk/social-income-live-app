import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  set,
  update,
  ref,
  on,
  onValue,
  off,
  increment,
  onDisconnect,
} from "firebase/database";

// Add your Firebase credentials
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appID: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function useFirebase(eventId = null, userId = null) {
  const [state, setState] = useState({});
  const [nowOnline, setNowOnline] = useState(0);
  const [participants, setParticipants] = useState(0);
  const [userInitialIncome, setUserInitialIncome] = useState(0);
  const docRef = ref(db, `events/${eventId}`);

  const read = () => {
    // console.log("event ID", eventId);
    return state;
  };

  const getUserIncome = () => {
    return userInitialIncome;
  };

  const incrementIncome = ({ eventId, userId, income, delta }) => {
    const updates = {};
    updates[`incomes/${eventId}/${userId}`] = income;
    updates[`events/${eventId}/income`] = increment(delta);
    return update(ref(db), updates);
  };

  const setStatus = (newStatus, eventId) => {
    const updates = {};
    updates[`events/${eventId}/status`] = newStatus;
    return update(ref(db), updates);
  };

  const getPresence = (eventId, userId) => {
    const userRef = ref(db, `isOnline/${eventId}/${userId}`);
    onValue(ref(db, ".info/connected"), (snapshot) => {
      if (snapshot.val() == false) {
        set(userRef, null);
        return;
      }
      onDisconnect(userRef)
        .set(null)
        .then(function () {
          set(userRef, "is online");
          console.log("user online");
        });
    });
  };

  const countPresence = () => {
    /*const presenceRef = ref(db, `isOnline/${eventId}`);
    onValue(presenceRef, (snapshot) => {
      const json = snapshot.toJSON() || {};
      console.log(json);
      setNowOnline(Object.keys(json).length);
    });*/
    return nowOnline;
  };

  const countParticipants = () => {
    return participants;
  };

  useEffect(() => {
    const userRef = ref(db, `isOnline/${eventId}/${userId}`);
    onValue(ref(db, ".info/connected"), (snapshot) => {
      if (snapshot.val() == false) {
        set(userRef, null);
        return;
      }
      onDisconnect(userRef)
        .set(null)
        .then(function () {
          set(userRef, "is online");
          console.log("user online");
        });
    });
    console.log("useEffect called", db);
    const presenceRef = ref(db, `isOnline/${eventId}`);
    onValue(presenceRef, (snapshot) => {
      const json = snapshot.toJSON() || {};
      console.log("Users online", json);
      setNowOnline(Object.keys(json).length);
    });
    // return state;
    onValue(
      docRef,
      (snapshot) => {
        const data = snapshot.val();
        setState({ ...state, ...data });
        console.log("data returned:", data);
      },
      (error) => {
        console.log("not connecting somehow");
      }
    );

    // count participants
    const incomeRef = ref(db, `incomes/${eventId}`);
    onValue(incomeRef, (snapshot) => {
      const json = snapshot.toJSON() || {};
      // console.log("Has sent income", json);
      setParticipants(Object.keys(json).length);
    });
    // user initial data
    const userIncomeRef = ref(db, `incomes/${eventId}/${userId}`);
    onValue(
      userIncomeRef,
      (snapshot) => {
        console.log("we got user income", snapshot.val());
        setUserInitialIncome(snapshot.val());
      },
      { onlyOnce: true }
    );

    return () => {
      console.log("unmounted");
      //off(docRef);
    };
  }, []);

  return {
    read,
    incrementIncome,
    setStatus,
    getPresence,
    getUserIncome,
    countPresence,
    countParticipants,
  };
}

export default useFirebase;
