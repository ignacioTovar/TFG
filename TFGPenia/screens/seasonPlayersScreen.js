import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../constants/styles';
import { getActiveSeasonId } from '../firebase/seasonService';
import { searchUsersByName } from '../firebase/userServices';
import { addPlayersToSeason, listSeasonPlayers, removePlayerFromSeason } from '../firebase/seasonPlayersServices';

export default function SeasonPlayersScreen() {
  const [seasonId, setSeasonId] = useState(null);
  const [loading, setLoading] = useState(true);

  // izquierda: buscador de usuarios (para añadir)
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // derecha: jugadores de la temporada
  const [roster, setRoster] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const sid = seasonId || await getActiveSeasonId();
      setSeasonId(sid);
      if (sid) {
        const rows = await listSeasonPlayers(sid);
        setRoster(rows);
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => { load(); }, [load]);

  // buscar en /users
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!q.trim()) { setSuggestions([]); return; }
      const rows = await searchUsersByName(q.trim(), 12);
      if (alive) setSuggestions(rows);
    })();
    return () => { alive = false; };
  }, [q]);

  const onAdd = async (u) => {
    if (!seasonId) return;
    await addPlayersToSeason(seasonId, [{ id: u.id, name: u.name || u.id }]);
    setQ(''); setSuggestions([]);
    await load();
  };

  const onRemove = async (playerId, name) => {
    Alert.alert('Quitar jugador', `¿Quitar a "${name}" de la temporada?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: async () => {
        await removePlayerFromSeason(seasonId, playerId);
        await load();
      }}
    ]);
  };

  if (loading) {
    return (
        <View style={styles.center}><ActivityIndicator /><Text style={{ color:'#666' }}>Cargando plantilla…</Text></View>
    );
  }

  return (
      <View style={{ flex:1, padding:12 }}>
        <View style={styles.root}>
            <Text style={styles.title}>Gestión de plantilla</Text>
            <Text style={styles.sub}>Temporada: <Text style={{fontWeight:'700'}}>{seasonId || '-'}</Text></Text>

            {/* Añadir desde /users */}
            <View style={styles.box}>
            <Text style={styles.h3}>Añadir jugador</Text>
            <TextInput
                placeholder="Buscar usuario por nombre…"
                value={q}
                onChangeText={setQ}
                style={styles.input}
            />
            {suggestions.length > 0 && (
                <View style={styles.suggestBox}>
                {suggestions.map(u => (
                    <View key={u.id} style={styles.suggestRow}>
                    <Text style={{ flex:1 }} numberOfLines={1}>{u.name || u.id}</Text>
                    <TouchableOpacity onPress={() => onAdd(u)} style={styles.addBtn}>
                        <Text style={{ color:'#1D4ED8', fontWeight:'700' }}>Añadir</Text>
                    </TouchableOpacity>
                    </View>
                ))}
                </View>
            )}
            </View>

            {/* Lista de jugadores de la temporada */}
            <View style={[styles.box, { flex:1 }]}>
            <Text style={styles.h3}>Jugadores de la temporada</Text>
            <FlatList
                data={roster}
                keyExtractor={(i) => i.id}
                onRefresh={load}
                refreshing={refreshing}
                style={{ flex: 1 }}                         
                contentContainerStyle={{ paddingBottom: 12 }} 
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={{ height:8 }} />}
                renderItem={({ item }) => (
                <View style={styles.row}>
                    <Text style={[styles.name]} numberOfLines={1}>{item.name || item.id}</Text>
                    <TouchableOpacity onPress={() => onRemove(item.id, item.name || item.id)} style={[styles.smallBtn, { backgroundColor:'#FEF2F2' }]}>
                    <Text style={{ color:'#b91c1c' }}>Quitar</Text>
                    </TouchableOpacity>
                </View>
                )}
                ListEmptyComponent={<Text style={{ color:'#6B7280' }}>Aún no hay jugadores en la temporada.</Text>}
            />
            </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12, backgroundColor: Colors?.background || '#fff' },
  center: { flex:1, alignItems:'center', justifyContent:'center', gap:8 },
  title: { fontSize:18, fontWeight:'800' },
  sub: { color:'#6B7280', marginBottom:8 },

  box: { borderWidth:1, borderColor:'#E5E7EB', borderRadius:10, padding:12, backgroundColor:'#fff', marginBottom:12 },
  h3: { fontSize:16, fontWeight:'700', marginBottom:8 },

  input: { borderWidth:1, borderColor:'#D1D5DB', borderRadius:8, paddingHorizontal:10, paddingVertical:8, backgroundColor:'#fff' },
  suggestBox: { marginTop:6, borderWidth:1, borderColor:'#E5E7EB', borderRadius:8, overflow:'hidden', maxHeight: 260 },
  suggestRow: { flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:10, paddingVertical:8, borderBottomWidth:1, borderColor:'#F3F4F6' },
  addBtn: { paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor:'#EEF2FF' },

  row: { padding:12, borderWidth:1, borderColor:'#F3F4F6', borderRadius:8, backgroundColor:'#fff', flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  name: { flex:1, fontSize:15, fontWeight:'700', color:'#111827', marginRight:12 },
  smallBtn: { paddingHorizontal:10, paddingVertical:6, borderRadius:8 },
});
