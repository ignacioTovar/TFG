// ---- Imports v2 ----
const {setGlobalOptions} = require("firebase-functions/v2");
const {onDocumentWritten, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

// ---- Config global (v2) ----
setGlobalOptions({
  region: "europe-southwest1",
  timeoutSeconds: 60,
  memory: "256MiB",
  maxInstances: 20,
});

admin.initializeApp();
const db = getFirestore();

// ---- Constantes y helpers ----
const PTS_WIN = 3; const PTS_DRAW = 1; const PTS_LOSS = 0;

function outcomeForTeam(a, b, team) {
  if (a === b) return "draw";
  if (team === "A") return a > b ? "win" : "loss";
  return b > a ? "win" : "loss";
}
function zeroTotals() {
  return {
    matchesPlayed: 0, wins: 0, draws: 0, losses: 0,
    goals: 0, assists: 0, yellowCards: 0, redCards: 0,
    points: 0, goalInvolvements: 0,
  };
}
function buildContribution(ps, scoreA, scoreB, team) {
  const oc = outcomeForTeam(scoreA, scoreB, team);
  const goals = Number(ps.goals || 0);
  const assists = Number(ps.assists || 0);
  return {
    matchesPlayed: 1,
    wins: oc === "win" ? 1 : 0,
    draws: oc === "draw" ? 1 : 0,
    losses: oc === "loss" ? 1 : 0,
    goals,
    assists,
    yellowCards: Number(ps.yellowCards || 0),
    redCards: Number(ps.redCards || 0),
    points: oc === "win" ? PTS_WIN : oc === "draw" ? PTS_DRAW : PTS_LOSS,
    goalInvolvements: goals + assists,
  };
}
function subtract(a, b) {
  const o={}; Object.keys(a).forEach(k=>o[k]=(a[k]||0)-(b[k]||0)); return o;
}
function addInto(acc, d) {
  const o={...(acc||{})}; Object.keys(d).forEach(k=>o[k]=(o[k]||0)+(d[k]||0)); return o;
}

// ---- v2: se dispara cuando escribes/actualizas stats de un jugador ----
exports.onPlayerStatsWrite = onDocumentWritten("matches/{matchId}/playerStats/{playerId}", async event => {
  const matchId = event.params.matchId;

  const matchRef = db.doc(`matches/${matchId}`);
  const matchSnap = await matchRef.get();
  if (!matchSnap.exists) return;
  const match = matchSnap.data();
  if (match.status !== "played") return;

  const seasonId = match.seasonId;
  const scoreA = match.teamA?.score ?? 0;
  const scoreB = match.teamB?.score ?? 0;

  const psSnaps = await matchRef.collection("playerStats").get();
  await Promise.all(psSnaps.docs.map(async d => {
    const ps = d.data() || {};
    const team = ps.team;
    if (team !== "A" && team !== "B") return;

    const C_new = buildContribution(ps, scoreA, scoreB, team);
    const aggRef = db.doc(`seasons/${seasonId}/players/${d.id}`);

    await db.runTransaction(async tx => {
      const aggSnap = await tx.get(aggRef);
      const agg = aggSnap.exists ? (aggSnap.data() || {}) : {};
      const prev = (agg.byMatch && agg.byMatch[matchId]) || zeroTotals();

      const delta = subtract(C_new, prev);
      const totals = addInto(agg.totals || {}, delta);
      const byMatch = {...(agg.byMatch || {}), [matchId]: C_new};

      tx.set(aggRef, {
        totals, byMatch,
        lastUpdated: FieldValue.serverTimestamp(),
      }, {merge: true});
    });
  }));
});

// ---- v2: al pasar un partido a 'played', toca playerStats para forzar recálculo ----
exports.onMatchUpdate = onDocumentUpdated("matches/{matchId}", async event => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  if (before.status === "played" || after.status !== "played") return;

  const psSnaps = await event.data.after.ref.collection("playerStats").get();
  const touch = FieldValue.serverTimestamp();
  await Promise.all(psSnaps.docs.map(d => d.ref.update({_touchedAt: touch})));
});

// ---- Ping opcional (v2) ----
// exports.ping = onRequest((req, res) => res.status(200).send('pong'));
