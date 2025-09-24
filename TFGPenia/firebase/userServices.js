import { db } from './firebaseConfig';
import {
  doc, getDoc, updateDoc, collection, getDocs, query, orderBy, startAt, endAt, limit
} from 'firebase/firestore';

/** Búsqueda por prefijo (case-sensitive, eficiente) */
export async function searchUsersByName(prefix, max = 10) {
  const users = collection(db, 'users');
  const q = query(
    users,
    orderBy('name'),
    startAt(prefix),
    endAt(prefix + '\uf8ff'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

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
