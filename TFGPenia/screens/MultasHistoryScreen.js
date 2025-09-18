// screens/MultasHistoryScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';

import { AuthContext } from '../context/AuthContext';
import { Colors } from '../constants/styles';
import { getUserHistorico, getUserMultasResumen } from '../firebase/multasService';
import { getAllUsersBasic } from '../firebase/userServices';

export default function MultasHistoryScreen() {
  const { user: authUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);                 // [{uid, name, email}, ...]
  const [selectedUid, setSelectedUid] = useState(null);   // uid seleccionado
  const [historico, setHistorico] = useState([]);
  const [resumen, setResumen] = useState({ multas: 0, pagado: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  // 1) Cargar lista de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingList(true);
        const list = await getAllUsersBasic();
        setUsers(list);

        // Seleccionar por defecto el usuario autenticado si aparece en la lista
        const defUid = authUser?.uid || (list[0]?.uid ?? null);
        setSelectedUid(defUid);
      } catch (e) {
        console.error('Error cargando usuarios:', e);
      } finally {
        setLoadingList(false);
      }
    };
    fetchUsers();
  }, [authUser?.uid]);

  // 2) Cargar histórico + resumen cuando cambie el seleccionado
  useEffect(() => {
    if (!selectedUid) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [hist, res] = await Promise.all([
          getUserHistorico(selectedUid),
          getUserMultasResumen(selectedUid),
        ]);
        setHistorico(hist);
        setResumen(res);
      } catch (e) {
        console.error('Error obteniendo histórico/resumen:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedUid]);

  const renderItem = ({ item }) => {
    const fechaStr = item.fecha ? format(item.fecha, 'dd/MM/yyyy HH:mm') : '—';
    const color = item.tipo === 'multa' ? Colors.error : Colors.blueLight;
    const signo = item.tipo === 'multa' ? '-' : '+';

    return (
      <View style={[styles.item, { borderLeftColor: color }]}>
        <Text style={styles.tipo}>{item.tipo.toUpperCase()}</Text>
        <Text style={styles.cantidad}>{signo} {item.cantidad.toFixed(2)} €</Text>
        <Text style={styles.fecha}>{fechaStr}</Text>
      </View>
    );
  };

  if (loadingList) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  const selectedUserName =
    users.find(u => u.uid === selectedUid)?.name || 'Usuario';

  return (
    <View style={styles.container}>
      {/* Selector de usuario */}
      <View style={styles.selectorCard}>
        <Text style={styles.selectorLabel}>Usuario</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedUid}
            onValueChange={(val) => setSelectedUid(val)}
            style={styles.picker}
            dropdownIconColor={Colors.textSecondary}
          >
            {users.map(u => (
              <Picker.Item key={u.uid} label={u.name} value={u.uid} />
            ))}
          </Picker>
        </View>
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
              No hay historial para {selectedUserName}.
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

  selectorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
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
  pickerWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
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
  cardPagado: { borderColor: Colors.blueDark },
  cardLabelSmall: { fontSize: 14, color: Colors.textSecondary, marginBottom: 6 },
  cardValueSmall: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});
