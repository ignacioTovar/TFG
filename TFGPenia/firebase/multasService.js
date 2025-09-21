import { db } from './firebaseConfig';
import { collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  Timestamp, 
  orderBy, 
  query, 
  increment,
  runTransaction } from 'firebase/firestore';

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

export async function addMulta(uid, cantidad, description) {
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
    description: String(description || ''),
    fecha: Timestamp.now(),
  });

  // Incrementar el total de multas
  await updateDoc(resumenRef, {
    multas: increment(cantidad),
  });
}


export async function addPago(uid, cantidad, description) {
  const resumenRef = doc(db, 'multas', uid);
  const historicoRef = collection(resumenRef, 'historico');

  // Crear documento resumen si no existe
  const snap = await getDoc(resumenRef);
  if (!snap.exists()) {
    await setDoc(resumenRef, { multas: 0, pagado: 0 });
  }

  // Añadir al histórico
  await addDoc(historicoRef, {
    tipo: 'pago',
    cantidad,
    description: String(description || ''),
    fecha: Timestamp.now(),
  });

  // Incrementar el total de pago
  await updateDoc(resumenRef, {
    pagado: increment(cantidad),
    multas: increment(-cantidad),
  });
}

export async function getUserHistorico(uid) {
  const historicoRef = collection(db, 'multas', uid, 'historico');
  const q = query(historicoRef, orderBy('fecha', 'desc'));

  const snap = await getDocs(q);

  return snap.docs.map(d => {
    const data = d.data();
    let jsDate = null;
    if (data.fecha?.toDate) jsDate = data.fecha.toDate();
    else if (data.fecha instanceof Date) jsDate = data.fecha;

    return {
      id: d.id,
      tipo: data.tipo,
      cantidad: Number(data.cantidad) || 0,
      description: data.description || '',
      fecha: jsDate,
    };
  });
}

export async function deleteHistoricoEntry(uid, entryId) {
  const resumenRef = doc(db, 'multas', uid);
  const entryRef = doc(db, 'multas', uid, 'historico', entryId);

  await runTransaction(db, async (tx) => {
    const entrySnap = await tx.get(entryRef);
    if (!entrySnap.exists()) {
      throw new Error('La entrada de histórico no existe.');
    }
    const entry = entrySnap.data();
    const { tipo, cantidad } = entry;

    // Asegurar que el resumen existe
    const resumenSnap = await tx.get(resumenRef);
    if (!resumenSnap.exists()) {
      tx.set(resumenRef, { multas: 0, pagado: 0 }, { merge: true });
    }

    if (tipo === 'multa') {
      tx.update(resumenRef, {
        multas: increment(-Number(cantidad)),
      });
    } else if (tipo === 'pago') {
      tx.update(resumenRef, {
        pagado: increment(-Number(cantidad)),
        multas: increment(Number(cantidad)), // revertimos la resta de multas hecha al pagar
      });
    } else {
      throw new Error('Tipo de entrada desconocido.');
    }

    tx.delete(entryRef);
  });
}