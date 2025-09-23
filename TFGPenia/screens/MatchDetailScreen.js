import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { listenMatch, listenPlayerStats } from '../firebase/matchesService';

const Head = () => (
  <View style={styles.tableHead}>
    <Text style={[styles.hName]}>Jugador</Text>
    <Text style={styles.hCell}>G</Text>
    <Text style={styles.hCell}>A</Text>
    <Text style={styles.hCell}>TA</Text>
    <Text style={styles.hCell}>TR</Text>
  </View>
);
const Row = ({ p, zebra }) => (
  <View style={[styles.row, zebra && styles.rowAlt]}>
    <Text style={[styles.name]} numberOfLines={1}>{p.name || p.id}</Text>
    <Text style={styles.cell}>{p.goals ?? 0}</Text>
    <Text style={styles.cell}>{p.assists ?? 0}</Text>
    <Text style={styles.cell}>{p.yellowCards ?? 0}</Text>
    <Text style={styles.cell}>{p.redCards ?? 0}</Text>
  </View>
);

export default function MatchDetailScreen() {
  const { params } = useRoute();
  const matchId = params?.matchId;

  const [match, setMatch] = useState(null);
  const [stats, setStats]   = useState([]);

  useFocusEffect(useCallback(() => {
    const unsub1 = listenMatch(matchId, setMatch);
    const unsub2 = listenPlayerStats(matchId, setStats);
    return () => { unsub1 && unsub1(); unsub2 && unsub2(); };
  }, [matchId]));

  if (!match) return <View style={styles.center}><ActivityIndicator /><Text style={{ color:'#666' }}>Cargando partido…</Text></View>;

  const a = match.teamA || {}, b = match.teamB || {};
  const date = match.date?.toDate?.() ? match.date.toDate() : new Date(match.date);
  const listA = stats.filter(p => p.team === 'A');
  const listB = stats.filter(p => p.team === 'B');

  return (
    <View style={{ flex:1, padding:12 }}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>{a.name}  {a.score ?? 0} - {b.score ?? 0}  {b.name}</Text>
        <Text style={styles.headerSub}>{date.toLocaleString()} · {match.status}</Text>
      </View>

      <Text style={styles.section}>Equipo {a.name || 'A'}</Text>
      <Head />
      <FlatList
        data={listA}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => <Row p={item} zebra={index % 2 === 1} />}
        ListEmptyComponent={<Text style={{ color:'#6B7280' }}>Sin datos.</Text>}
      />

      <Text style={styles.section}>Equipo {b.name || 'B'}</Text>
      <Head />
      <FlatList
        data={listB}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => <Row p={item} zebra={index % 2 === 1} />}
        ListEmptyComponent={<Text style={{ color:'#6B7280' }}>Sin datos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center', gap:8 },
  headerCard: { borderWidth:1, borderColor:'#E5E7EB', borderRadius:10, backgroundColor:'#fff', padding:12, marginBottom:10 },
  headerTitle: { fontSize:18, fontWeight:'800', color:'#111827' },
  headerSub: { marginTop:4, color:'#6B7280' },

  section: { fontSize:16, fontWeight:'800', marginTop:12, marginBottom:6 },
  tableHead: { flexDirection:'row', alignItems:'center', borderBottomWidth:1, borderColor:'#E5E7EB', paddingVertical:6, marginTop:4 },
  hName: { flex:1, fontWeight:'700', color:'#475467' },
  hCell: { width:48, textAlign:'center', fontWeight:'700', color:'#475467' },

  row: { flexDirection:'row', alignItems:'center', paddingVertical:10 },
  rowAlt: { backgroundColor:'#F8FAFF' },
  name: { flex:1, fontSize:15, color:'#111827' },
  cell: { width:48, textAlign:'center', fontSize:15, color:'#111827' },
});
