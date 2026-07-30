import type firebaseCompat from 'firebase/compat/app';

import firebase, { db } from './index';
import { ensureSavedMessagesConversationExists } from './conversations';
import type {
  ProfileAdditionalEmail,
  ProfileContact,
  ProfilePhoneNumber,
  ProfileSocialLink,
} from '../types/profile';

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

export async function upsertUserProfile(user: firebaseCompat.User): Promise<void> {
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

    await ensureSavedMessagesConversationExists(
      user.uid,
      baseData.displayName,
      baseData.avatarColor,
      baseData.avatarUrl
    );
  }
}

export function subscribeToContacts(
  excludeUserId: string,
  callback: (contacts: Contact[]) => void
): firebaseCompat.Unsubscribe {
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

export async function getUserById(userId: string): Promise<Contact | null> {
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data();
  return {
    id: userDoc.id,
    displayName: data?.displayName ?? data?.name ?? null,
    email: data?.email ?? null,
    avatarUrl: data?.avatarUrl ?? null,
    avatarColor: data?.avatarColor ?? pickAvatarColor(userId),
    status: data?.status ?? null,
  };
}

const normalizeAdditionalEmails = (
  value: unknown
): ProfileAdditionalEmail[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const entry = item as Record<string, unknown>;

      return {
        id:
          typeof entry.id === 'string' && entry.id.trim()
            ? entry.id
            : `email-${index}`,
        label:
          typeof entry.label === 'string' && entry.label.trim()
            ? entry.label
            : 'Email',
        email:
          typeof entry.email === 'string' && entry.email.trim()
            ? entry.email
            : '',
      };
    })
    .filter(Boolean) as ProfileAdditionalEmail[];
};

const normalizePhoneNumbers = (value: unknown): ProfilePhoneNumber[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const entry = item as Record<string, unknown>;

      return {
        id:
          typeof entry.id === 'string' && entry.id.trim()
            ? entry.id
            : `phone-${index}`,
        label:
          typeof entry.label === 'string' && entry.label.trim()
            ? entry.label
            : 'Phone',
        phone:
          typeof entry.phone === 'string' && entry.phone.trim()
            ? entry.phone
            : '',
      };
    })
    .filter(Boolean) as ProfilePhoneNumber[];
};

const normalizeSocialLinks = (value: unknown): ProfileSocialLink[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const entry = item as Record<string, unknown>;

      return {
        id:
          typeof entry.id === 'string' && entry.id.trim()
            ? entry.id
            : `social-${index}`,
        label:
          typeof entry.label === 'string' && entry.label.trim()
            ? entry.label
            : 'Social',
        url:
          typeof entry.url === 'string' && entry.url.trim()
            ? entry.url
            : 'https://example.com',
      };
    })
    .filter(Boolean) as ProfileSocialLink[];
};

export function subscribeToUserProfile(
  userId: string,
  callback: (profile: ProfileContact | null) => void
): firebaseCompat.Unsubscribe {
  return db
    .collection('users')
    .doc(userId)
    .onSnapshot((snapshot) => {
      if (!snapshot.exists) {
        callback(null);
        return;
      }

      const data = snapshot.data() ?? {};

      const profile: ProfileContact = {
        id: snapshot.id,
        name:
          (typeof data.displayName === 'string' && data.displayName) ||
          (typeof data.name === 'string' && data.name) ||
          (typeof data.email === 'string' && data.email) ||
          'Unknown user',
        email: typeof data.email === 'string' ? data.email : null,
        avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : null,
        avatarColor:
          typeof data.avatarColor === 'string'
            ? data.avatarColor
            : pickAvatarColor(snapshot.id),
        statusMessage:
          typeof data.status === 'string'
            ? data.status
            : typeof data.statusMessage === 'string'
            ? data.statusMessage
            : null,
        company:
          typeof data.company === 'string'
            ? data.company
            : 'Piche Communications',
        department:
          data.department && typeof data.department === 'object'
            ? (data.department as { name?: string | null })
            : null,
        position:
          data.position && typeof data.position === 'object'
            ? (data.position as { jobTitle?: string | null })
            : null,
        additionalEmails: normalizeAdditionalEmails(data.additionalEmails),
        phoneNumbers: normalizePhoneNumbers(data.phoneNumbers),
        address:
          data.address && typeof data.address === 'object'
            ? (data.address as ProfileContact['address'])
            : null,
        socialLinks: normalizeSocialLinks(data.socialLinks),
        coverImageUrl:
          typeof data.coverImageUrl === 'string' ? data.coverImageUrl : null,
      };

      callback(profile);
    });
}
