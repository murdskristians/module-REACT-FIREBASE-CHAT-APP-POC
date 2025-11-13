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

export type UserProfile = Contact & {
  company?: string | null;
  department?: string | null;
  position?: string | null;
  additionalEmails?: Array<{ id: string; label: string; email: string }>;
  phoneNumbers?: Array<{ id: string; label: string; phone: string }>;
  address?: {
    country?: string | null;
    street?: string | null;
    postalCode?: string | null;
    city?: string | null;
  };
  socialLinks?: Array<{ id: string; label: string; url: string }>;
  coverImageUrl?: string | null;
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

export function subscribeToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
): firebase.Unsubscribe {
  return db
    .collection('users')
    .doc(userId)
    .onSnapshot((doc) => {
      if (!doc.exists) {
        callback(null);
        return;
      }

      const data = doc.data() ?? {};

      callback({
        id: doc.id,
        displayName: (data.displayName ?? data.name ?? null) as string | null,
        email: (data.email ?? null) as string | null,
        avatarUrl: (data.avatarUrl ?? null) as string | null,
        avatarColor: (data.avatarColor ?? null) as string | null,
        status: (data.status ?? null) as string | null,
        company: (data.company ?? null) as string | null,
        department: (data.department ?? null) as string | null,
        position: (data.position ?? null) as string | null,
        additionalEmails: (data.additionalEmails ?? []) as Array<{
          id: string;
          label: string;
          email: string;
        }>,
        phoneNumbers: (data.phoneNumbers ?? []) as Array<{
          id: string;
          label: string;
          phone: string;
        }>,
        address: (data.address ?? null) as {
          country?: string | null;
          street?: string | null;
          postalCode?: string | null;
          city?: string | null;
        } | null,
        socialLinks: (data.socialLinks ?? []) as Array<{
          id: string;
          label: string;
          url: string;
        }>,
        coverImageUrl: (data.coverImageUrl ?? null) as string | null,
      });
    });
}
