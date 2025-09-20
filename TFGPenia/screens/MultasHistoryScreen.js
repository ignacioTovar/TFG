import { useEffect, useCallback, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';

import { AuthContext } from '../context/AuthContext';
import { Colors } from '../constants/styles';
import { getUserHistorico, getUserMultasResumen, deleteHistoricoEntry } from '../firebase/multasService';
import { getAllUsersBasic, getUserProfile } from '../firebase/userServices';

export default function MultasHistoryScreen({ navigation }) {
  const { user: authUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);                 // [{uid, name, email}, ...]
  const [selectedUid, setSelectedUid] = useState(null);   // uid seleccionado
  const [historico, setHistorico] = useState([]);
  const [resumen, setResumen] = useState({ multas: 0, pagado: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Mostrar nombre legible
  const labelFor = (u) => u?.name || u?.email || u?.uid || 'Usuario';

  // 1) Cargar lista de usuarios y rol del usuario autenticado
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingList(true);
        const [list, me] = await Promise.all([
          getAllUsersBasic(),
          getUserProfile(authUser?.uid),
        ]);
        setUsers(list);
        setIsAdmin((me?.role || me?.rol) === 'admin'); // por si algún doc viejo usa 'rol'
        // selecciona por defecto el propio usuario si está en la lista, si no el primero
        const defUid = authUser?.uid || (list[0]?.uid ?? null);
        setSelectedUid(defUid);
      } catch (e) {
        console.error('Error cargando usuarios/perfil actual:', e);
      } finally {
        setLoadingList(false);
      }
    };
    if (authUser?.uid) load();
  }, [authUser?.uid]);

  // 2) Cargar histórico + resumen cuando cambie el seleccionado
 useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetchData = async () => {
        if (!selectedUid) return;
        try {
          setLoading(true);
          const [hist, res] = await Promise.all([
            getUserHistorico(selectedUid),
            getUserMultasResumen(selectedUid),
          ]);
          if (!active) return;
          setHistorico(hist);
          setResumen(res);
        } catch (e) {
          console.error('Error obteniendo histórico/resumen:', e);
        } finally {
          if (active) setLoading(false);
        }
      };
      fetchData();
      return () => { active = false; };
    }, [selectedUid])
  );

  const handleDelete = (item) => {
  if (!isAdmin) return;

  const title = item.tipo === 'multa' ? 'Eliminar multa' : 'Eliminar pago';
  const msg = `¿Seguro que quieres eliminar este registro?\n\n${item.tipo.toUpperCase()} · ${item.cantidad.toFixed(2)} €${item.description ? `\n${item.description}` : ''}`;

  Alert.alert(title, msg, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Eliminar',
      style: 'destructive',
      onPress: async () => {
        try {
          await deleteHistoricoEntry(selectedUid, item.id);

          // Actualiza UI al instante (optimista)
          setHistorico((prev) => prev.filter((h) => h.id !== item.id));
          setResumen((prev) => {
            if (item.tipo === 'multa') {
              return { ...prev, multas: Math.max(0, (prev.multas || 0) - item.cantidad) };
            } else {
              return {
                ...prev,
                pagado: Math.max(0, (prev.pagado || 0) - item.cantidad),
                multas: (prev.multas || 0) + item.cantidad,
              };
            }
          });
        } catch (e) {
          console.error('Error eliminando entrada:', e);
          Alert.alert('Error', 'No se pudo eliminar la entrada.');
        }
      }
    }
  ]);
};


  const renderItem = ({ item }) => {
  const fechaStr = item.fecha ? format(item.fecha, 'dd/MM/yyyy HH:mm') : '—';
  const color = item.tipo === 'multa' ? Colors.error : Colors.success;
  const signo = item.tipo === 'multa' ? '-' : '+';

  return (
    <TouchableOpacity
      activeOpacity={isAdmin ? 0.7 : 1}
      onLongPress={isAdmin ? () => handleDelete(item) : undefined}
    >
      <View style={[styles.item, { borderLeftColor: color }]}>
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.tipo}>{item.tipo.toUpperCase()}</Text>
          <Text style={styles.cantidad}>{signo} {item.cantidad.toFixed(2)} €</Text>
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
        </View>
        <Text style={styles.fecha}>{fechaStr}</Text>
      </View>
    </TouchableOpacity>
  );
};


  if (loadingList) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  // usuario actualmente seleccionado (para mostrar su nombre arriba)
  const selectedUser = users.find(u => u.uid === selectedUid);

  return (
    <View style={styles.container}>
      {/* Cabecera con selector y botón admin */}
      <View style={styles.selectorRow}>
        <View style={styles.selectorCard}>
          <Text style={styles.selectorLabel}>Usuario seleccionado</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedUid}
              onValueChange={(val) => setSelectedUid(val)}
              style={styles.picker}
              dropdownIconColor={Colors.textSecondary}
            >
              {users.map(u => (
                <Picker.Item key={u.uid} label={labelFor(u)} value={u.uid} />
              ))}
            </Picker>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddMultaPago', { uid: selectedUid })}
          >
            <Text style={styles.addBtnText}>Añadir{'\n'}multa/pago</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 32 }}>
              No hay historial para {labelFor(selectedUser)}.
            </Text>
          }
        />
      )}

      {/* Footer fijo con resumen */}
      <View style={styles.footer}>
        <View style={[styles.cardSmall, styles.cardMultas]}>
          <Text style={styles.cardLabelSmall}>Multas</Text>
          <Text style={styles.cardValueSmall}>{resumen.multas.toFixed(2)} €</Text>
        </View>
        <View style={[styles.cardSmall, styles.cardPagado]}>
          <Text style={styles.cardLabelSmall}>Pagado</Text>
          <Text style={styles.cardValueSmall}>{resumen.pagado.toFixed(2)} €</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },

  selectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'stretch',
  },
  selectorCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    elevation: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginLeft: 4,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginLeft: 4,
  },
  pickerWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  picker: { 
    width: '100%', 
    height: 50, 
  },

  addBtn: {
    width: 120,
    backgroundColor: Colors.blueLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 2,
  },
  addBtnText: {
    color: Colors.surface,
    textAlign: 'center',
    fontWeight: '700',
  },

  item: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  tipo: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary },
  cantidad: { fontSize: 16, fontWeight: '600', marginVertical: 4, color: Colors.textPrimary },
  fecha: { fontSize: 12, color: Colors.textSecondary },
  description: {
  fontSize: 13,
  color: Colors.textSecondary,
  marginTop: 2,
},

  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardSmall: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  cardMultas: { borderColor: Colors.error },
  cardPagado: { borderColor: Colors.success },
  cardLabelSmall: { fontSize: 14, color: Colors.textSecondary, marginBottom: 6 },
  cardValueSmall: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});
