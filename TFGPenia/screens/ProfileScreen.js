import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useContext, useEffect, useState } from 'react';
import { getUserProfile } from '../firebase/userServices';
import { AuthContext } from '../context/AuthContext';
import { logout as firebaseLogout } from '../firebase/auth';
import Button from '../components/ui/Button'; // si tienes un botón personalizado

import { Colors } from '../constants/styles'; // <— tu nuevo Colors

export default function ProfileScreen({ navigation }) {
  const { user: authUser, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await getUserProfile(authUser.uid);
        setUserData(data);
      } catch (error) {
        console.error('Error cargando perfil:', error);
      }
    };
    loadUserData();
  }, []);

  if (!userData) {
    return <Text>Cargando...</Text>;
  }

  const formatMoney = (amount) => `${(amount || 0).toFixed(2)} €`;

  return (
    <View style={styles.container}>
      {/* Avatar, nombre, email */}
      <View style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <Image
            source={{ uri: userData.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userData.name}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile', { userData })}
            style={styles.editIcon}
          >
            <Icon name="pencil-outline" size={32} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Nombre</Text>
          <Text style={styles.cardValue}>{userData.name}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{userData.email}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Telefono</Text>
          <Text style={styles.cardValue}>{userData.phone}</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.cardSmall, styles.cardMultas]}>
            <Text style={styles.cardLabelSmall}>Multas</Text>
            <Text style={styles.cardValueSmall}>{formatMoney(userData.multas)}</Text>
          </View>
          <View style={[styles.cardSmall, styles.cardPagado]}>
            <Text style={styles.cardLabelSmall}>Pagado</Text>
            <Text style={styles.cardValueSmall}>{formatMoney(userData.pagado)}</Text>
          </View>
        </View>

        {/* Estadísticas opcional */}
        {userData.stats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Estadísticas</Text>
            <View style={styles.statsGrid}>
              {Object.entries(userData.stats).map(([label, value]) => (
                <View key={label} style={styles.statItem}>
                  <Text style={styles.statLabel}>{label}</Text>
                  <Text style={styles.statValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={{ width: '100%', alignItems: 'center', marginTop: 12, marginBottom: 24 }}>
        <View style={{ width: '60%' }}>
          <Button onPress={async () => { await firebaseLogout(); logout(); }}>Cerrar sesión</Button>
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
