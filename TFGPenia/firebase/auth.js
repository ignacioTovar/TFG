import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

//Sign up new user with email and password
function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      return user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      throw new Error(`Error signing up: ${errorCode} - ${errorMessage}`);
    });
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