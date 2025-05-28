import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen({ navigation }) {
  // Datos de ejemplo, luego vienen de Firebase/Auth
  const user = {
    name: 'Juan Pérez',
    avatar: 'https://espanol.motorsport.com/driver/fernando-alonso/463646/',
  };

 return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}> 
        <View style={styles.header}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editIcon}
          >
            <Icon name="pencil-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={styles.content}>
        {/* Aquí irán campos adicionales como email, estadísticas, etc. */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  headerSafeArea: {
    backgroundColor: '#007AFF',
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
    borderColor: 'white',
  },
  userName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  editIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});