import { StyleSheet, Text, View, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>¡Bienvenido a tu Peña!</Text>
      <Button
        title="Ver Clasificación"
        onPress={() => navigation.navigate('Classification')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
