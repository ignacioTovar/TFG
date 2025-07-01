import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from './firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

//Sign up new user with email and password
async function signUp(email, password, userData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Crear documento en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: userData.name || '',
      phone: userData.phone || '',
      rol: userData.rol || 'player',
      creadoEn: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw new Error(`Error al registrar usuario: ${error.code} - ${error.message}`);
  }
}

// Sign in existing user with email and password
function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      return user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      throw new Error(`Error signing in: ${errorCode} - ${errorMessage}`);
    });
}

// Sign out user
function logout() {
  return signOut(auth);
}

export { signUp, signIn, logout };