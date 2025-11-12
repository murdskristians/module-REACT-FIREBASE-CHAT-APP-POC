import type firebaseCompat from 'firebase/compat/app';

import firebase, { db } from './index';

export type FirestoreMessage = {
  id: string;
  text: string;
  createdAt?: firebaseCompat.firestore.Timestamp | null;
  uid?: string;
  displayName?: string | null;
  photoURL?: string | null;
};

export type MessagePayload = {
  text: string;
  uid?: string;
  displayName?: string | null;
  photoURL?: string | null;
};

const messagesCollection = () => db.collection('messages');

export const subscribeToMessages = (
  callback: (messages: FirestoreMessage[]) => void,
  limit = 100
): firebaseCompat.Unsubscribe =>
  messagesCollection()
    .orderBy('createdAt')
    .limit(limit)
    .onSnapshot((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as firebaseCompat.firestore.DocumentData),
        id: doc.id,
      })) as FirestoreMessage[];

      callback(data);
    });

export const sendMessage = async ({
  text,
  uid,
  displayName,
  photoURL,
}: MessagePayload): Promise<
  firebaseCompat.firestore.DocumentReference<firebaseCompat.firestore.DocumentData>
> =>
  messagesCollection().add({
    text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    uid,
    displayName,
    photoURL,
  });
