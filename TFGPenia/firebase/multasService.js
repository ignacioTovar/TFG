import { db } from './firebaseConfig';
import { collection, addDoc, doc,getDoc, updateDoc, Timestamp } from 'firebase/firestore';

export async function getUserMultasResumen(uid) {
  const ref = doc(db, 'multas', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      multas: data.multas || 0,
      pagado: data.pagado || 0,
    };
  } else {
    // Si no existe, devolver cero
    return { multas: 0, pagado: 0 };
  }
}

export async function addMulta(uid, cantidad) {
  const resumenRef = doc(db, 'multas', uid);
  const historicoRef = collection(resumenRef, 'historico');

  // Crear documento resumen si no existe
  const snap = await getDoc(resumenRef);
  if (!snap.exists()) {
    await setDoc(resumenRef, { multas: 0, pagado: 0 });
  }

  // Añadir al histórico
  await addDoc(historicoRef, {
    tipo: 'multa',
    cantidad,
    fecha: Timestamp.now(),
  });

  // Incrementar el total de multas
  await updateDoc(resumenRef, {
    multas: increment(cantidad),
  });
}


export async function addPago(uid, cantidad) {
  const resumenRef = doc(db, 'multas', uid);
  const historicoRef = collection(resumenRef, 'historico');

  const snap = await getDoc(resumenRef);
  if (!snap.exists()) {
    await setDoc(resumenRef, { multas: 0, pagado: 0 });
  }

  await addDoc(historicoRef, {
    tipo: 'pago',
    cantidad,
    fecha: Timestamp().now(),
  });

  await updateDoc(resumenRef, {
    pagado: increment(cantidad),
  });
}

export async function getUserHistorico(uid) {
  const ref = doc(db, 'multas', uid);
  const historicoRef = collection(ref, 'historico');
  const q = query(historicoRef, orderBy('fecha', 'desc'));

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    fecha: doc.data().fecha.toDate(), // Convertir Timestamp a Date
  }));
}