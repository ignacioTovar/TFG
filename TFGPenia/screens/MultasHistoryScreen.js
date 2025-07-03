import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getUserHistorico } from '../firebase/multasService';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../constants/styles';
import { format } from 'date-fns';

export default function MultasHistoryScreen() {
  const { user } = useContext(AuthContext);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const fetchHistorico = async () => {
      const data = await getUserHistorico(user.uid);
      setHistorico(data);
    };

    fetchHistorico();
  }, []);

  const renderItem = ({ item }) => {
    const fecha = item.fecha?.toDate ? format(item.fecha.toDate(), 'dd/MM/yyyy HH:mm') : '—';
    const color = item.tipo === 'multa' ? Colors.error : Colors.blueLight;
    const signo = item.tipo === 'multa' ? '-' : '+';

    return (
      <View style={[styles.item, { borderLeftColor: color }]}>
        <Text style={styles.tipo}>{item.tipo.toUpperCase()}</Text>
        <Text style={styles.cantidad}>{signo} {item.cantidad.toFixed(2)} €</Text>
        <Text style={styles.fecha}>{fecha}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No hay historial disponible.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  tipo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  cantidad: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
    color: Colors.textPrimary,
  },
  fecha: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
