import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/styles';
import { addMulta, addPago } from '../firebase/multasService';

export default function AddFinePaymentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const uid = route.params?.uid; 

  const [type, setType] = useState('multa');;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const value = parseFloat(amount.replace(',', '.'));

    if (!uid) {
      Alert.alert('Error', 'No se ha indicado el usuario.');
      return;
    }
    if (isNaN(value) || value <= 0) {
      Alert.alert('Importe inválido', 'Introduce un número mayor que 0.');
      return;
    }

    try {

      setSaving(true);
      if (type === 'multa') {
        await addMulta(uid, value, description);
      } else {
        await addPago(uid, value, description);
      }

      Alert.alert('Éxito', `${type === 'multa' ? 'Multa' : 'Pago'} añadido.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error('Error guardando multa/pago:', e);
      Alert.alert('Error', 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Añadir multa / pago</Text>

        {/* Toggle tipo */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'multa' && styles.toggleActiveMulta]}
            onPress={() => setType('multa')}
          >
            <Text
              style={[
                styles.toggleText,
                type === 'multa' && styles.toggleTextActive,
              ]}
            >
              Multa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, type === 'pago' && styles.toggleActivePago]}
            onPress={() => setType('pago')}
          >
            <Text
              style={[
                styles.toggleText,
                type === 'pago' && styles.toggleTextActive,
              ]}
            >
              Pago
            </Text>
          </TouchableOpacity>
        </View>

        {/* Importe */}
        <View style={styles.field}>
          <Text style={styles.label}>Importe (€)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>

         {/* Descripción */}
        <View style={styles.field}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Tarde a la convocatoria"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.saveText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  toggleActiveMulta: {
    borderColor: Colors.error,
    backgroundColor: '#fdecec',
  },
  toggleActivePago: {
    borderColor: Colors.blueLight,
    backgroundColor: '#e9f2ff',
  },
  toggleText: {
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.textPrimary,
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: Colors.blueLight,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    elevation: 2,
  },
  saveText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
