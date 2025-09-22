import { db } from './firebaseConfig';
import { collection, query, orderBy, getDocs, onSnapshot, limit, where } from 'firebase/firestore';

export async function getActiveSeasonId() {
  const q = query(collection(db, 'seasons'), where('isActive', '==', true), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}

function playersQuery(seasonId) {
  return query(
    collection(db, `seasons/${seasonId}/players`),
    orderBy('totals.points', 'desc'),
    orderBy('totals.wins', 'desc'),
    orderBy('totals.goalInvolvements', 'desc')
  );
}

export async function getActiveRanking() {
  const seasonId = await getActiveSeasonId();
  if (!seasonId) return { seasonId: null, players: [] };
  const snap = await getDocs(playersQuery(seasonId));
  return { seasonId, players: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
}

export function listenActiveRanking(onData, onError) {
  let unsub = null;
  (async () => {
    try {
      const seasonId = await getActiveSeasonId();
      if (!seasonId) { onData({ seasonId: null, players: [] }); return; }
      unsub = onSnapshot(
        playersQuery(seasonId),
        (snap) => onData({ seasonId, players: snap.docs.map(d => ({ id: d.id, ...d.data() })) }),
        (err) => onError && onError(err)
      );
    } catch (e) { onError && onError(e); }
  })();
  return () => unsub && unsub();
}
