// components/Auth/AuthContent.js
import { useState, useContext } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AuthForm from './AuthForm';
import FlatButton from '../ui/FlatButton';
import { Colors } from '../../constants/styles';
import { signIn, signUp } from '../../firebase/auth';
import { AuthContext } from '../../context/AuthContext';

function AuthContent({ isLogin }) {
  const navigation = useNavigation();
  const authCtx = useContext(AuthContext);

  const [credentialsInvalid, setCredentialsInvalid] = useState({
    email: false,
    password: false,
    confirmEmail: false,
    confirmPassword: false,
  });

  function switchAuthModeHandler() {
    navigation.replace(isLogin ? 'Signup' : 'Login');
  }

  async function submitHandler({ email, confirmEmail, password, confirmPassword, name }) {
  email = email.trim();
  password = password.trim();

  const emailIsValid = email.includes('@');
  const passwordIsValid = password.length > 6;
  const emailsAreEqual = email === confirmEmail;
  const passwordsAreEqual = password === confirmPassword;

  if (!emailIsValid || !passwordIsValid || (!isLogin && (!emailsAreEqual || !passwordsAreEqual))) {
    Alert.alert('Credenciales inválidas', 'Revisa los datos introducidos.');
    setCredentialsInvalid({
      email: !emailIsValid,
      confirmEmail: !emailIsValid || !emailsAreEqual,
      password: !passwordIsValid,
      confirmPassword: !passwordIsValid || !passwordsAreEqual,
    });
    return;
  }

  try {
    let user;

    if (isLogin) {
      user = await signIn(email, password);
    } else {
      const userData = {
        name: name,
        phone: '',
        rol: 'player',
      };

      user = await signUp(email, password, userData);
    }

    authCtx.authenticate({ uid: user.uid, email: user.email });
  } catch (error) {
    Alert.alert('Error', error.message);
  }
}

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>
        {isLogin ? 'Inicia sesión' : 'Regístrate'}
      </Text>
      <View style={styles.authBox}>
        <AuthForm
          isLogin={isLogin}
          onSubmit={submitHandler}
          credentialsInvalid={credentialsInvalid}
        />
        <View style={styles.buttons}>
          <FlatButton onPress={switchAuthModeHandler}>
            {isLogin ? 'Crear una nueva cuenta' : '¿Ya tienes cuenta? Inicia sesión'}
          </FlatButton>
        </View>
      </View>
    </View>
  );
}

export default AuthContent;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary800,
    marginBottom: 16,
  },
  authBox: {
    width: '100%',
    backgroundColor: Colors.primary100,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttons: {
    marginTop: 12,
    alignItems: 'center',
  },
});
