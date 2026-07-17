import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import type { FormSchema, FormValues, StoredForm, Submission } from "./types";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
});
const db = getFirestore(app);

const newId = () => Math.random().toString(36).slice(2, 8);

export async function publishForm(schema: FormSchema): Promise<string> {
  const id = newId();
  await setDoc(doc(db, "forms", id), { schema, createdAt: Date.now() });
  return id;
}

export async function getForm(id: string): Promise<StoredForm | null> {
  const snap = await getDoc(doc(db, "forms", id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { id, schema: d.schema as FormSchema, createdAt: d.createdAt };
}

export function watchForms(cb: (forms: StoredForm[]) => void): () => void {
  const q = query(collection(db, "forms"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (qs) =>
    cb(
      qs.docs.map((d) => ({
        id: d.id,
        schema: d.data().schema as FormSchema,
        createdAt: d.data().createdAt,
      })),
    ),
  );
}

export async function submitValues(
  formId: string,
  values: FormValues,
): Promise<string> {
  const ref = await addDoc(collection(db, "forms", formId, "submissions"), {
    values,
    createdAt: Date.now(),
  });
  return ref.id;
}

export function watchSubmissions(
  formId: string,
  cb: (subs: Submission[]) => void,
): () => void {
  const q = query(
    collection(db, "forms", formId, "submissions"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (qs) =>
    cb(
      qs.docs.map((d) => ({
        id: d.id,
        formId,
        values: d.data().values as FormValues,
        createdAt: d.data().createdAt,
      })),
    ),
  );
}

export async function getSubmission(
  formId: string,
  subId: string,
): Promise<Submission | null> {
  const snap = await getDoc(doc(db, "forms", formId, "submissions", subId));
  if (!snap.exists()) return null;
  return {
    id: subId,
    formId,
    values: snap.data().values as FormValues,
    createdAt: snap.data().createdAt,
  };
}
