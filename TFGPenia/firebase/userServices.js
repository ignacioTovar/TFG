import { db } from './firebaseConfig';
import { doc, getDoc, getDocs, updateDoc, orderBy, query, collection } from 'firebase/firestore';

export async function getUserProfile(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    throw new Error('Usuario no encontrado en Firestore');
  }
}

export async function updateUserProfile(uid, newData) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, newData);
}

export async function getAllUsersBasic() {
  const q = query(collection(db, 'users'), orderBy('name'));
  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    uid: d.id,
    ...(d.data() || {}),
  }));
}
