import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export function useAuthRole() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubUserDoc = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setRole(null);

      // corta el listener anterior si lo hubiera
      if (unsubUserDoc) { unsubUserDoc(); unsubUserDoc = null; }

      if (!u) { setLoading(false); return; }

      // escucha /users/{uid} con manejo de error
      unsubUserDoc = onSnapshot(
        doc(db, 'users', u.uid),
        (snap) => {
          setRole(snap.exists() ? (snap.data().rol || null) : null);
          setLoading(false);
        },
        (err) => {
          if (err?.code === 'permission-denied') {
            // durante el sign-out puede disparar; lo ignoramos
            setRole(null);
            setLoading(false);
            return;
          }
          console.error('useAuthRole onSnapshot error:', err);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubUserDoc) unsubUserDoc();
      unsubAuth();
    };
  }, []);

  return { user, role, isAdmin: role === 'admin', isSignedIn: !!user, loading };
}
