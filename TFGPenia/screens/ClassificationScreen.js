import { View, Text, StyleSheet } from 'react-native';

export default function ClassificationScreen() {
    return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>Clasificacion</Text>
      <Text>Aquí irá la tabla de clasificacion.</Text>
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