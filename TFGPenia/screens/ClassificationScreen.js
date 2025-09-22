import { useCallback, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl,
  StyleSheet, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveRanking, listenActiveRanking } from '../firebase/seasonService';

export default function ClassificationScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const unsub = listenActiveRanking(
        ({ players }) => { setRows(players); setLoading(false); },
        (err) => { setErrorMsg(err?.message || 'Error de conexión'); setLoading(false); }
      );
      return () => unsub();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { players } = await getActiveRanking();
      setRows(players);
    } catch (e) {
      setErrorMsg(e?.message || 'Error al recargar');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const Header = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.hCell, { width: 44 }]}>#</Text>
      <Text style={[styles.hCell, styles.hPlayer]}>Jugador</Text>
      <Text style={styles.hCell}>PJ</Text>
      <Text style={styles.hCell}>W</Text>
      <Text style={styles.hCell}>D</Text>
      <Text style={styles.hCell}>L</Text>
      <Text style={styles.hCell}>G</Text>
      <Text style={styles.hCell}>A</Text>
      <Text style={styles.hCell}>TA</Text>
      <Text style={styles.hCell}>TR</Text>
      <Text style={[styles.hCell, { width: 70 }]}>Pts</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const t = item.totals || {};
    return (
      <View style={[styles.row, index % 2 ? styles.rowAlt : null]}>
        <Text style={[styles.pos]}>{index + 1}</Text>
        <Text style={[styles.player]} numberOfLines={1}>{item.name || item.id}</Text>
        <Text style={styles.cell}>{t.matchesPlayed || 0}</Text>
        <Text style={styles.cell}>{t.wins || 0}</Text>
        <Text style={styles.cell}>{t.draws || 0}</Text>
        <Text style={styles.cell}>{t.losses || 0}</Text>
        <Text style={[styles.cell, styles.bold]}>{t.goals || 0}</Text>
        <Text style={styles.cell}>{t.assists || 0}</Text>
        <Text style={styles.cell}>{t.yellowCards || 0}</Text>
        <Text style={styles.cell}>{t.redCards || 0}</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{t.points || 0}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: '#666', fontSize: 16 }}>Cargando clasificación…</Text>
      </View>
    );
  }


  return (
    <ScrollView horizontal bounces showsHorizontalScrollIndicator>
      {/* minWidth permite que las columnas respiren */}
      <View style={{ minWidth: 900, flex: 1 }}>
        {errorMsg ? <Text style={{ color: 'tomato', padding: 12 }}>{errorMsg}</Text> : null}

        <FlatList
          data={rows}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          ListHeaderComponent={Header}
          stickyHeaderIndices={[0]}      // cabecera pegajosa
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
    </ScrollView>
  );
}

const baseFont = 16; // sube o baja este valor para todo
const cellW = 64;    // ancho de las columnas numéricas
const PLAYER_COL_W = 120;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderBottomWidth: 1,
    borderColor: '#E6E8EC',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  hCell: {
    width: cellW,
    textAlign: 'center',
    fontWeight: '700',
    color: '#475467',
    fontSize: baseFont,
  },
  hPlayer: { width: PLAYER_COL_W, textAlign:'left', paddingLeft: 6 },
  player:  { width: PLAYER_COL_W, paddingRight: 8, color:'#111827', fontWeight:'600', fontSize: baseFont + 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowAlt: { backgroundColor: '#FAFAFF' },
  pos: { width: 44, textAlign: 'center', fontWeight: '800', color: '#111827', fontSize: baseFont + 2 },
  cell: { width: cellW, textAlign: 'center', color: '#111827', fontSize: baseFont + 1 },
  bold: { fontWeight: '700' },
  pointsBadge: {
    width: 70, height: 36, borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  pointsText: { color: '#3B82F6', fontWeight: '800', fontSize: baseFont + 2 },
});