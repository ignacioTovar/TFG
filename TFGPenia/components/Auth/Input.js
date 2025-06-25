import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/styles';

function Input({
  label,
  keyboardType,
  secure,
  onUpdateValue,
  value,
  isInvalid,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, isInvalid && styles.labelInvalid]}>
        {label}
      </Text>
      <TextInput
        style={[styles.input, isInvalid ? styles.inputInvalid : styles.inputValid]}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        onChangeText={onUpdateValue}
        value={value}
        autoCapitalize="none"
      />
      {/* Mensaje de error opcional (puedes gestionarlo con una prop extra si lo deseas) */}
      {/* {isInvalid && <Text style={styles.errorText}>Este campo no es válido</Text>} */}
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 10,
  },
  label: {
    color: Colors.primary800,
    fontSize: 14,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  labelInvalid: {
    color: Colors.error500,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  inputValid: {
    borderColor: Colors.primary500,
  },
  inputInvalid: {
    borderColor: Colors.error500,
    backgroundColor: Colors.error100,
  },
  errorText: {
    marginTop: 4,
    color: Colors.error500,
    fontSize: 12,
  },
});
