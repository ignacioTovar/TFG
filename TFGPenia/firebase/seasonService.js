import { db } from './firebaseConfig';
import { collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';

export async function getRanking(seasonId, limitN=200) {
  const col = collection(db, `seasons/${seasonId}/players`);
  const q = query(
    col,
    orderBy('totals.points', 'desc'),
    orderBy('totals.wins', 'desc'),
    orderBy('totals.goalInvolvements', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function listenRanking(seasonId, callback) {
  const col = collection(db, `seasons/${seasonId}/players`);
  const q = query(
    col,
    orderBy('totals.points', 'desc'),
    orderBy('totals.wins', 'desc'),
    orderBy('totals.goalInvolvements', 'desc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function getSeason(seasonId) {
  const s = await getDoc(doc(db, 'seasons', seasonId));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}
