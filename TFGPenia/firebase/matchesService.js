import { db } from './firebaseConfig';
import {
  addDoc, collection, doc, setDoc, updateDoc, getDocs,
  query, where, orderBy, onSnapshot
} from 'firebase/firestore';

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

export async function upsertPlayerStats(matchId, playerId, { team, goals = 0, assists = 0, yellowCards = 0, redCards = 0 }) {
  await setDoc(doc(db, 'matches', matchId, 'playerStats', playerId), {
    team,
    goals, assists, yellowCards, redCards,
    updatedAt: new Date(),
  }, { merge: true });
}

export async function setFinalScore(matchId, scoreA, scoreB) {
  await updateDoc(doc(db, 'matches', matchId), {
    'teamA.score': Number(scoreA) || 0,
    'teamB.score': Number(scoreB) || 0,
    updatedAt: new Date(),
  });
}

export async function setPlayed(matchId) {
  await updateDoc(doc(db, 'matches', matchId), {
    status: 'played',
    updatedAt: new Date(),
  });
}

export async function listMatches(seasonId) {
  const q = query(
    collection(db, 'matches'),
    where('seasonId', '==', seasonId),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function listenMatches(seasonId, callback) {
  const q = query(
    collection(db, 'matches'),
    where('seasonId', '==', seasonId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
