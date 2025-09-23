// src/matchesService.js
import { db } from './firebaseConfig';
import {
  addDoc, collection, doc, setDoc, updateDoc, getDocs, getDoc,
  query, orderBy, onSnapshot, limit
} from 'firebase/firestore';

// Crear partido
export async function createMatch({ seasonId, date, teamAName, teamBName }) {
  const ref = await addDoc(collection(db, 'matches'), {
    seasonId,
    date,
    status: 'scheduled',
    teamA: { name: teamAName, score: 0 },
    teamB: { name: teamBName, score: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return ref.id;
}

// Añadir/actualizar stats de jugador (opción 2: intentamos poner name siempre)
export async function upsertPlayerStats(
  seasonId,
  matchId,
  playerId,
  { team, goals = 0, assists = 0, yellowCards = 0, redCards = 0, name }
) {
  let finalName = name;
  if (!finalName) {
    const p = await getDoc(doc(db, `seasons/${seasonId}/players/${playerId}`));
    finalName = p.exists() ? (p.data()?.name || playerId) : playerId;
  }
  await setDoc(
    doc(db, 'matches', matchId, 'playerStats', playerId),
    { team, goals, assists, yellowCards, redCards, name: finalName, updatedAt: new Date() },
    { merge: true }
  );
}

// Cerrar partido
export async function setFinalScore(matchId, scoreA, scoreB) {
  await updateDoc(doc(db, 'matches', matchId), {
    'teamA.score': Number(scoreA) || 0,
    'teamB.score': Number(scoreB) || 0,
    updatedAt: new Date(),
  });
}

export async function setPlayed(matchId) {
  await updateDoc(doc(db, 'matches', matchId), { status: 'played', updatedAt: new Date() });
}

// Historial (todos los partidos)
export async function getAllMatches(max = 300) {
  const q = query(collection(db, 'matches'), orderBy('date', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function listenAllMatches(callback, onError) {
  const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
  return onSnapshot(q, s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => onError && onError(e));
}

// Detalle de partido
export async function getMatch(matchId) {
  const s = await getDoc(doc(db, 'matches', matchId));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}

export function listenMatch(matchId, onData, onError) {
  return onSnapshot(doc(db, 'matches', matchId), s => onData(s.exists() ? { id: s.id, ...s.data() } : null), onError);
}

// Stats de jugadores (ya con name en el documento)
export async function getPlayerStats(matchId) {
  const snap = await getDocs(collection(db, 'matches', matchId, 'playerStats'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function listenPlayerStats(matchId, onData, onError) {
  return onSnapshot(collection(db, 'matches', matchId, 'playerStats'),
    s => onData(s.docs.map(d => ({ id: d.id, ...d.data() }))), onError);
}
