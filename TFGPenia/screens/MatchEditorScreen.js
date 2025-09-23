import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Button,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createMatch, getMatch, setFinalScore, setPlayed, upsertPlayerStats } from '../firebase/matchesService';
import { searchSeasonPlayersByName } from '../firebase/playersService';
import { getActiveSeasonId } from '../firebase/seasonsService';


function useDebouncedState(initial, delay = 250) {
  const [val, setVal] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  useEffect(() => { const t = setTimeout(() => setDebounced(val), delay); return () => clearTimeout(t); }, [val, delay]);
  return [val, setVal, debounced];
}

function StatEditorRow({ item, onChange, onRemove }) {
  const { name, team, goals=0, assists=0, yellowCards=0, redCards=0 } = item;
  return (
    <View style={styles.statRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.playerName} numberOfLines={1}>{name}</Text>
        <View style={styles.teamLine}>
          <Text style={styles.teamLabel}>Equipo:</Text>
          <TouchableOpacity onPress={() => onChange({ ...item, team: team === 'A' ? 'B' : 'A' })} style={styles.teamChip}>
            <Text style={styles.teamChipText}>{team || 'A'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.kvs}>
        <View style={styles.kv}><Text>G</Text><TextInput style={styles.ninput} keyboardType="numeric" value={String(goals)} onChangeText={(t)=>onChange({ ...item, goals: Number(t)||0 })}/></View>
        <View style={styles.kv}><Text>A</Text><TextInput style={styles.ninput} keyboardType="numeric" value={String(assists)} onChangeText={(t)=>onChange({ ...item, assists: Number(t)||0 })}/></View>
        <View style={styles.kv}><Text>TA</Text><TextInput style={styles.ninput} keyboardType="numeric" value={String(yellowCards)} onChangeText={(t)=>onChange({ ...item, yellowCards: Number(t)||0 })}/></View>
        <View style={styles.kv}><Text>TR</Text><TextInput style={styles.ninput} keyboardType="numeric" value={String(redCards)} onChangeText={(t)=>onChange({ ...item, redCards: Number(t)||0 })}/></View>
      </View>
      <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}><Text style={{color:'#b91c1c'}}>Quitar</Text></TouchableOpacity>
    </View>
  );
}

export default function MatchEditorScreen() {
  const { params } = useRoute();
  const nav = useNavigation();
  const passedMatchId = params?.matchId || null;

  const [loading, setLoading] = useState(true);

  // Partido
  const [matchId, setMatchId] = useState(passedMatchId);
  const [seasonId, setSeasonId] = useState(null);
  const [teamAName, setTeamAName] = useState('Rojo');
  const [teamBName, setTeamBName] = useState('Azul');
  const [dateISO, setDateISO] = useState(new Date().toISOString());
  const [scoreA, setScoreA] = useState('0');
  const [scoreB, setScoreB] = useState('0');

  // Búsqueda/selección
  const [q, setQ, qDebounced] = useDebouncedState('', 300);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState({}); // id -> row
  const selectedList = useMemo(() => Object.values(selected), [selected]);

  // Cargar season activa y/o partido
  useEffect(() => {
    (async () => {
      const sid = await getActiveSeasonId();
      setSeasonId(sid);
      if (passedMatchId) {
        const m = await getMatch(passedMatchId);
        if (m) {
          setTeamAName(m.teamA?.name || 'Equipo A');
          setTeamBName(m.teamB?.name || 'Equipo B');
          setDateISO(m.date?.toDate?.() ? m.date.toDate().toISOString() : (m.date || new Date()).toString());
          setScoreA(String(m.teamA?.score ?? 0));
          setScoreB(String(m.teamB?.score ?? 0));
        }
      }
      setLoading(false);
    })();
  }, [passedMatchId]);

  // Autocomplete contra ROSTER
  useEffect(() => {
  let alive = true;
  (async () => {
    if (!qDebounced || !seasonId) { setSuggestions([]); return; }
    const res = await searchSeasonPlayersByName(seasonId, qDebounced, true, 12);
    if (alive) setSuggestions(res);
  })();
  return () => { alive = false; };
}, [qDebounced, seasonId]);


  const onCreateMatch = async () => {
    if (matchId || !seasonId) return;
    const id = await createMatch({
      seasonId,
      date: new Date(dateISO),
      teamAName: teamAName || 'Equipo A',
      teamBName: teamBName || 'Equipo B',
    });
    setMatchId(id);
  };

  const addSuggestion = (u, team = 'A') => {
    setSelected(s => ({
      ...s,
      [u.id]: s[u.id] || { id: u.id, name: u.name || u.id, team, goals:0, assists:0, yellowCards:0, redCards:0 }
    }));
    setQ(''); setSuggestions([]);
  };
  const updateSelected = (row) => setSelected(s => ({ ...s, [row.id]: row }));
  const removeSelected = (id) => setSelected(s => { const n={...s}; delete n[id]; return n; });

  const saveAllStats = async () => {
    if (!matchId || !seasonId) return;
    for (const row of selectedList) {
      await upsertPlayerStats(
        seasonId,    // ⬅️ ahora va primero
        matchId,
        row.id,
        { team: row.team||'A', goals: row.goals||0, assists: row.assists||0, yellowCards: row.yellowCards||0, redCards: row.redCards||0, name: row.name||row.id }
      );
    }
  };
  const closeMatch = async () => {
    if (!matchId) return;
    await setFinalScore(matchId, Number(scoreA)||0, Number(scoreB)||0);
    await saveAllStats();
    await setPlayed(matchId);
    nav.goBack();
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text style={{color:'#666'}}>Cargando…</Text></View>;

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex:1 }}>
      <FlatList
        ListHeaderComponent={
          <View style={{ padding: 12 }}>
            <Text style={styles.h2}>{matchId ? 'Editar partido' : 'Crear partido'}</Text>

            <View style={styles.rowLine}><Text style={{ width: 80 }}>Equipo A</Text><TextInput style={styles.input} value={teamAName} onChangeText={setTeamAName} editable={!matchId}/></View>
            <View style={styles.rowLine}><Text style={{ width: 80 }}>Equipo B</Text><TextInput style={styles.input} value={teamBName} onChangeText={setTeamBName} editable={!matchId}/></View>
            <View style={styles.rowLine}><Text style={{ width: 80 }}>Fecha</Text><TextInput style={styles.input} value={dateISO} onChangeText={setDateISO} editable={!matchId}/></View>

            {!matchId ? (
              <Button title="Crear partido" onPress={onCreateMatch} />
            ) : (
              <>
                <View style={[styles.rowLine, { marginTop: 8 }]}>
                  <Text style={{ width: 80 }}>Marcador</Text>
                  <TextInput style={[styles.input, styles.inputShort]} keyboardType="numeric" value={scoreA} onChangeText={setScoreA} />
                  <Text style={{ paddingHorizontal: 6 }}> - </Text>
                  <TextInput style={[styles.input, styles.inputShort]} keyboardType="numeric" value={scoreB} onChangeText={setScoreB} />
                </View>

                <Text style={[styles.h3, { marginTop: 12 }]}>Añadir jugadores (roster)</Text>
                <View style={styles.searchRow}>
                  <TextInput placeholder="Buscar en la plantilla…" value={q} onChangeText={setQ} style={[styles.input, { flex:1 }]} />
                </View>

                {suggestions.length > 0 && (
                  <View style={styles.suggestBox}>
                    {suggestions.map(u => (
                      <View key={u.id} style={styles.suggestRow}>
                        <Text style={{ flex:1 }} numberOfLines={1}>{u.name || u.id}</Text>
                        <TouchableOpacity onPress={() => addSuggestion(u, 'A')} style={[styles.addBtn, { backgroundColor: '#EEF2FF' }]}><Text style={{color:'#1D4ED8'}}>A</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => addSuggestion(u, 'B')} style={[styles.addBtn, { backgroundColor: '#FEF3C7' }]}><Text style={{color:'#92400E'}}>B</Text></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={[styles.h3, { marginTop: 12 }]}>Plantillas & estadísticas</Text>
              </>
            )}
          </View>
        }
        data={selectedList}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <StatEditorRow item={item} onChange={updateSelected} onRemove={removeSelected} />}
        ListFooterComponent={matchId ? (
          <View style={{ padding: 12, gap: 8 }}>
            <Button title="Guardar estadísticas" onPress={saveAllStats} />
            <Button title="Cerrar partido (played)" onPress={closeMatch} />
          </View>
        ) : null}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center', gap:8 },
  h2: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  h3: { fontSize: 16, fontWeight: '700' },
  rowLine: { flexDirection:'row', alignItems:'center', gap:8, marginBottom:8 },
  input: { flex:1, borderWidth:1, borderColor:'#D1D5DB', borderRadius:8, paddingHorizontal:10, paddingVertical:8, backgroundColor:'#fff' },
  inputShort: { width: 64, flex: undefined },
  searchRow: { flexDirection:'row', alignItems:'center', gap:8, marginTop:6 },
  suggestBox: { borderWidth:1, borderColor:'#E5E7EB', borderRadius:8, marginTop:6, backgroundColor:'#fff' },
  suggestRow: { flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:10, paddingVertical:8, borderBottomWidth:1, borderColor:'#F3F4F6' },
  addBtn: { paddingHorizontal:10, paddingVertical:6, borderRadius:8 },
  statRow: { paddingHorizontal:12, paddingVertical:10, borderBottomWidth:1, borderColor:'#F3F4F6', backgroundColor:'#fff', flexDirection:'row', alignItems:'center', gap:10 },
  playerName: { fontSize:15, fontWeight:'700', color:'#111827', maxWidth:160 },
  teamLine: { flexDirection:'row', alignItems:'center', gap:6, marginTop:4 },
  teamLabel: { color:'#6B7280' },
  teamChip: { backgroundColor:'#EEF2FF', paddingHorizontal:10, paddingVertical:4, borderRadius:9999 },
  teamChipText: { color:'#1D4ED8', fontWeight:'700' },
  kvs: { flexDirection:'row', alignItems:'center', gap:10, marginLeft: 'auto' },
  kv: { flexDirection:'row', alignItems:'center', gap:6 },
  ninput: { width:52, textAlign:'center', borderWidth:1, borderColor:'#D1D5DB', borderRadius:6, paddingVertical:6, backgroundColor:'#fff' },
  removeBtn: { paddingHorizontal:8, paddingVertical:6, borderRadius:6, backgroundColor:'#FEF2F2' },
});
