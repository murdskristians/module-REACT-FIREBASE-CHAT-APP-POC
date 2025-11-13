import firebase from 'firebase/compat/app';

import { db } from './index';

export type Contact = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  status?: string | null;
};

const AVATAR_COLORS = [
  '#FFD37D',
  '#A8D0FF',
  '#FFC8DD',
  '#B5EAEA',
  '#BDB2FF',
  '#FFABAB',
  '#CAF0F8',
];

const pickAvatarColor = (uid: string) => {
  const hash = uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export async function upsertUserProfile(user: firebase.User): Promise<void> {
  const userRef = db.collection('users').doc(user.uid);
  const snapshot = await userRef.get();

  const baseData = {
    displayName: user.displayName ?? user.email ?? 'Unknown user',
    email: user.email ?? null,
    avatarUrl: user.photoURL ?? null,
    avatarColor: snapshot.exists
      ? snapshot.data()?.avatarColor ?? pickAvatarColor(user.uid)
      : pickAvatarColor(user.uid),
    status: 'Online',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  if (snapshot.exists) {
    await userRef.set(baseData, { merge: true });
  } else {
    await userRef.set({
      ...baseData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
}

export function subscribeToContacts(
  excludeUserId: string,
  callback: (contacts: Contact[]) => void
): firebase.Unsubscribe {
  return db.collection('users').onSnapshot((snapshot) => {
    const contacts = snapshot.docs
      .filter((doc) => doc.id !== excludeUserId)
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName ?? data.name ?? null,
          email: data.email ?? null,
          avatarUrl: data.avatarUrl ?? null,
          avatarColor: data.avatarColor ?? null,
          status: data.status ?? null,
        } satisfies Contact;
      });

    callback(contacts);
  });
}
