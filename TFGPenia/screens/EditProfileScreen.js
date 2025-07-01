import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../firebase/userServices';
import { Colors } from '../constants/styles';

export default function EditProfileScreen({ navigation }) {
  const authCtx = useContext(AuthContext);
  const uid = authCtx.user?.uid;

  const [profile, setProfile] = useState({
    nombre: '',
    email: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserProfile(uid);
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el perfil.');
        console.error('Error al cargar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSave = async () => {
    if (!profile.nombre.trim()) {
      Alert.alert('Nombre inválido', 'El nombre no puede estar vacío.');
      return;
    }
    if (!isValidEmail(profile.email)) {
      Alert.alert('Email inválido', 'Introduce un email válido.');
      return;
    }
    if (!profile.telefono.trim()) {
      Alert.alert('Teléfono inválido', 'El teléfono no puede estar vacío.');
      return;
    }

    try {
      await updateUserProfile(uid, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      Alert.alert('Perfil actualizado', 'Tus cambios han sido guardados.', [
  {
    text: 'OK',
    onPress: () => navigation.navigate('ProfileScreen'),
  },
]);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
      console.error(error);
    }
  };

  if (loading) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>Cargando perfil...</Text>;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ----- CAMPO Nombre ----- */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Tu nombre"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />
        </View>

        {/* ----- CAMPO Email ----- */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* ----- CAMPO Teléfono ----- */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="123456789"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        {/* ----- BOTÓN “Guardar cambios” ----- */}
        <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
          <Text style={styles.buttonSaveText}>Guardar cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  fieldGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.surface,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    shadowColor: Colors.grayDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonSave: {
    width: '100%',
    backgroundColor: Colors.blueLight,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Colors.grayDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonSaveText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
