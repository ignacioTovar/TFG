import { db } from './firebaseConfig';
import {
  collection, doc, setDoc, deleteDoc, getDocs, query, orderBy
} from 'firebase/firestore';

/**
 * Añade (o si existe, actualiza) jugadores a la temporada.
 * players: Array<{ id: string, name: string }>
 */
export async function addPlayersToSeason(seasonId, players) {
  const col = collection(db, `seasons/${seasonId}/players`);
  await Promise.all(players.map(p =>
    setDoc(
      doc(col, p.id),
      {
        name: p.name || p.id,
        // Totales a cero si el doc no existía; si existía, no los tocamos.
        totals: {
          matchesPlayed: 0, wins: 0, draws: 0, losses: 0,
          goals: 0, assists: 0, yellowCards: 0, redCards: 0,
          points: 0, goalInvolvements: 0,
        }
      },
      { merge: true }
    )
  ));
}

/** Elimina un jugador de la temporada (no borra históricos de matches). */
export async function removePlayerFromSeason(seasonId, playerId) {
  await deleteDoc(doc(db, `seasons/${seasonId}/players/${playerId}`));
}

/** Lista de jugadores de la temporada ordenada por nombre. */
export async function listSeasonPlayers(seasonId) {
  const qref = query(collection(db, `seasons/${seasonId}/players`), orderBy('name'));
  const snap = await getDocs(qref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
