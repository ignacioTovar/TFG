// screens/EditProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker'; // Si usas Expo
import { Colors } from '../constants/styles';

export default function EditProfileScreen({ navigation }) {
  // Simulación de datos iniciales; en producción, los traes de Firebase/Auth
  const [profile, setProfile] = useState({
    nombre: 'Ignacio',
    email: 'ignacio@email.com',
    telefono: '123456789',
    avatar:
      'https://espanol.motorsport.com/driver/fernando-alonso/463646/', // URL simulada
  });

  // Para almacenar la URI local de la nueva imagen si el usuario la cambia
  const [newAvatarUri, setNewAvatarUri] = useState(null);

  // Función que asocia cada campo con su valor en el estado
  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Validación básica de email (patrón muy simple)
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Al pulsar “Guardar”, validamos y simularíamos la llamada a Firebase
  const handleSave = () => {
    if (profile.nombre.trim().length === 0) {
      Alert.alert('Nombre inválido', 'El nombre no puede estar vacío.');
      return;
    }
    if (!isValidEmail(profile.email)) {
      Alert.alert('Email inválido', 'Introduce un email con formato correcto.');
      return;
    }
    if (profile.telefono.trim().length === 0) {
      Alert.alert('Teléfono inválido', 'El teléfono no puede estar vacío.');
      return;
    }

    // Aquí podrías subir la nueva imagen (newAvatarUri) a tu storage y obtener la URL,
    // después guardar el resto de campos en Firestore o Auth.
    // Por simplicidad, simulo que se ha guardado todo correctamente:
    Alert.alert('Perfil actualizado', 'Tus cambios han sido guardados.');
    navigation.goBack();
  };

  // Función para abrir la galería y permitir al usuario escoger una imagen de perfil
  const pickImage = async () => {
    // Pedimos permisos de acceso a la galería (solo en iOS/Android con Expo)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus imágenes para cambiar el avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.cancelled) {
      // result.uri es la URI local de la imagen seleccionada
      setNewAvatarUri(result.uri);
      // Si quisieras subirla inmediatamente, aquí harías la llamada al storage.
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ----- AVATAR EDITABLE ----- */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: newAvatarUri ? newAvatarUri : profile.avatar,
            }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={pickImage}
          >
            <Icon name="camera-outline" size={20} color="white" />
            <Text style={styles.changeAvatarText}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* ----- CAMPO Nombre ----- */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={profile.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
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
            value={profile.telefono}
            onChangeText={(text) => handleChange('telefono', text)}
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
    backgroundColor: Colors.background,   // '#F7F8F9'
  },
  /* ====== SCROLL CONTENT ====== */
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center', // para centrar avatar y contenido
  },

  /* ====== AVATAR EDITABLE ====== */
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#ccc',
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: Colors.blueLight, 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeAvatarText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },

  /* ====== CAMPOS DEL FORMULARIO ====== */
  fieldGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,          // '#4A4A4A'
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.surface,      // '#FFFFFF'
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.grayLight,        // '#E0E0E0'
    // Sombra iOS
    shadowColor: Colors.grayDark,         // '#707070'
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Elevation Android
    elevation: 1,
  },
  buttonSave: {
    width: '100%',
    backgroundColor: Colors.blueLight,    // '#4A90E2'
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    // Sombra iOS
    shadowColor: Colors.grayDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation Android
    elevation: 2,
  },
  buttonSaveText: {
    color: Colors.surface,                // '#FFFFFF'
    fontSize: 16,
    fontWeight: '600',
  },
});
