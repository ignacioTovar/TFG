import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/ui/Button';
import { Colors } from '../constants/styles';

export default function AdminHomeScreen({ navigation }) {
  return (
    <View style={styles.rootContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Panel de Administración</Text>
        <Text style={styles.subtitle}>Elige una opción para continuar</Text>

        <View style={styles.buttonContainer}>
          <Button onPress={() => navigation.navigate('SeasonRoster')}>
            Gestionar plantilla de la temporada
          </Button>
        </View>

        <View style={styles.buttonContainer}>
          <Button onPress={() => navigation.navigate('MatchEditor')}>
            Crear / Editar partido
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: Colors.grayDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
});
