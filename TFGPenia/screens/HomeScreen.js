import { StyleSheet, Text, View} from 'react-native';
import Button from '../components/ui/Button';
import { Colors } from '../constants/styles';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>¡Bienvenido a tu Peña!</Text>
      <Button onPress={() => navigation.navigate('Classification')}>
        Ver Clasificacion
      </Button>
    </View>
  );
}


const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,   // antes default transparente
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.textPrimary,            // color principal del texto
  },
});

