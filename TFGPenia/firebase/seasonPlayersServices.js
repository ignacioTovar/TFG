import { db } from './firebaseConfig';
import {
  collection, doc, setDoc, deleteDoc, getDocs, query,
  orderBy, startAt, endAt, limit, where
} from 'firebase/firestore';

// Sembrar/añadir jugadores a la temporada (puedes llamarlo al crear la season)
export async function addPlayersToSeason(seasonId, players /* [{id, name, active?}] */) {
  const col = collection(db, `seasons/${seasonId}/players`);
  const writes = players.map(p => setDoc(doc(col, p.id), {
    name: p.name || p.id,
    active: p.active ?? true,
    totals: {
      matchesPlayed: 0, wins: 0, draws: 0, losses: 0,
      goals: 0, assists: 0, yellowCards: 0, redCards: 0,
      points: 0, goalInvolvements: 0,
    },
    createdAt: new Date()
  }, { merge: true }));
  await Promise.all(writes);
}

export async function removePlayerFromSeason(seasonId, playerId) {
  await deleteDoc(doc(db, `seasons/${seasonId}/players/${playerId}`));
}

// Buscar entre jugadores de la temporada (para el picker del partido)
export async function searchSeasonPlayersByName(seasonId, prefix, onlyActive = true, max = 10) {
  if (!prefix?.trim()) return [];
  let qref = collection(db, `seasons/${seasonId}/players`);
  // Si filtras por active==true y ordenas por name, Firestore te puede pedir un índice compuesto (active asc, name asc)
  qref = onlyActive
    ? query(qref, where('active', '==', true), orderBy('name'), startAt(prefix), endAt(prefix + '\uf8ff'), limit(max))
    : query(qref, orderBy('name'), startAt(prefix), endAt(prefix + '\uf8ff'), limit(max));
  const snap = await getDocs(qref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listSeasonPlayers(seasonId, onlyActive = true) {
  let qref = collection(db, `seasons/${seasonId}/players`);
  qref = onlyActive ? query(qref, where('active', '==', true), orderBy('name')) : query(qref, orderBy('name'));
  const snap = await getDocs(qref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
