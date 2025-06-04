// ProfileScreen.js  (convertido a paleta minimalista)
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/styles'; // <— tu nuevo Colors

export default function ProfileScreen({ navigation }) {
  const user = {
    username: 'JuanjitoKitKAt',
    name: 'Juan Pérez',
    avatar: 'https://espanol.motorsport.com/driver/fernando-alonso/463646/',
    email: 'juan.perez@email.com',
    multas: 45.50,
    pagado: 120.00,
    stats: {
      jugados: 12,
      ganados: 8,
      goles: 15,
      asistencias: 7,
    },
  };

  const formatMoney = (amount) => `${amount.toFixed(2)} €`;

  return (
    <View style={styles.container}>
      {/* ----- HEADER ----- */}
      <View style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.username}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editIcon}
          >
            <Icon name="pencil-outline" size={32} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ----- CONTENIDO ----- */}
      <View style={styles.content}>
        {/* Card de Nombre */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Nombre</Text>
          <Text style={styles.cardValue}>{user.name}</Text>
        </View>

        {/* Card de Email */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{user.email}</Text>
        </View>

        {/* Fila Multas / Pagado */}
        <View style={styles.row}>
          <View style={[styles.cardSmall, styles.cardMultas]}>
            <Text style={styles.cardLabelSmall}>Multas</Text>
            <Text style={styles.cardValueSmall}>{formatMoney(user.multas)}</Text>
          </View>
          <View style={[styles.cardSmall, styles.cardPagado]}>
            <Text style={styles.cardLabelSmall}>Pagado</Text>
            <Text style={styles.cardValueSmall}>{formatMoney(user.pagado)}</Text>
          </View>
        </View>

        {/* Card de Estadísticas */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estadísticas 2023/2024</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Jugados</Text>
              <Text style={styles.statValue}>{user.stats.jugados}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ganados</Text>
              <Text style={styles.statValue}>{user.stats.ganados}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Goles</Text>
              <Text style={styles.statValue}>{user.stats.goles}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Asistencias</Text>
              <Text style={styles.statValue}>{user.stats.asistencias}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,      // antes '#f2f2f6'
  },

  /* ----- HEADER ----- */
  headerSafeArea: {
    backgroundColor: Colors.blueDark,        // antes '#007AFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.surface,             // antes 'white'
    backgroundColor: Colors.grayLight,       // antes '#cccccc'
  },
  userName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.surface,                   // antes 'white'
  },
  editIcon: {
    padding: 8,
  },

  /* ----- CONTENIDO ----- */
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  /* Tarjeta grande (Nombre / Email) */
  card: {
    width: '100%',
    backgroundColor: Colors.surface,         // '#FFFFFF'
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,

    // Sombra (iOS)
    shadowColor: Colors.grayDark,            // antes '#000'
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,                     // antes 0.1
    shadowRadius: 4,

    // Elevation (Android)
    elevation: 2,
  },
  cardLabel: {
    fontSize: 16,
    color: Colors.textSecondary,             // antes '#555555'
    marginBottom: 6,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,               // antes '#222222'
    textAlign: 'center',
  },

  /* Fila con dos tarjetas pequeñas */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },

  /* Tarjetas chicas (Multas/Pagado) */
  cardSmall: {
    flex: 1,
    backgroundColor: Colors.surface,         // '#FFFFFF'
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 12,
    marginHorizontal: 6,

    shadowColor: Colors.grayDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,

    alignItems: 'center',
  },
  cardLabelSmall: {
    fontSize: 14,
    color: Colors.textSecondary,             // '#4A4A4A'
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValueSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,               // '#1E1E1E'
    textAlign: 'center',
  },
  /* Bordes Multas / Pagado */
  cardMultas: {
    borderColor: Colors.error,               // '#D32F2F'
    borderWidth: 1,
  },
  cardPagado: {
    borderColor: Colors.blueDark,            // '#2C3E50'
    borderWidth: 1,
  },

  /* Tarjeta de Estadísticas */
  statsCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,

    shadowColor: Colors.grayDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,

    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,               // '#1E1E1E'
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,             // '#4A4A4A'
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,               // '#1E1E1E'
    textAlign: 'center',
  },
});
