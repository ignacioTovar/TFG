import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllMatches, listenAllMatches } from '../firebase/matchesService';

const fmt = (d) => {
  const date = d?.toDate?.() ? d.toDate() : new Date(d);
  return isNaN(date) ? '' : date.toLocaleString();
};
const Pill = ({ status }) => {
  const bg = status === 'played' ? '#DCFCE7' : '#FFEFB3';
  const tx = status === 'played' ? '#166534' : '#7A5800';
  return <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
    <Text style={{ color: tx, fontWeight: '700' }}>{status}</Text>
  </View>;
};

export default function MatchesHistoryScreen() {
  const nav = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    const unsub = listenAllMatches(setItems);
    setLoading(false);
    return () => unsub && unsub();
  }, []));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = await getAllMatches();
    setItems(data);
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }) => {
    const a = item.teamA || {}, b = item.teamB || {};
    return (
      <TouchableOpacity style={styles.card} onPress={() => nav.navigate('MatchDetail', { matchId: item.id })}>
        <View style={styles.row}>
          <Text style={styles.teams} numberOfLines={1}>
            {a.name}  {a.score ?? 0} - {b.score ?? 0}  {b.name}
          </Text>
          <Pill status={item.status} />
        </View>
        <Text style={styles.date}>{fmt(item.date)}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text style={{ color:'#666' }}>Cargando partidos…</Text></View>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center', gap:8 },
  card: { borderWidth:1, borderColor:'#E5E7EB', borderRadius:10, padding:12, backgroundColor:'#fff' },
  row: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  teams: { fontSize:16, fontWeight:'700', color:'#111827', flex:1, paddingRight:10 },
  date: { marginTop:6, color:'#6B7280' },
});
