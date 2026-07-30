/**
 * Contacts that exist before the visitor arrives, so the people list and user
 * search aren't empty. The demo conversation itself is still seeded by
 * src/firebase/demoSeed.ts through the normal app code paths.
 */

import { DemoFirestore, DemoTimestamp } from './firestore';

export const DEMO_BOT_ID = 'demo-assistant';

const CONTACTS = [
  {
    id: DEMO_BOT_ID,
    displayName: 'Demo Assistant',
    email: null,
    avatarColor: '#A8D0FF',
    status: 'Online',
  },
  {
    id: 'demo-user-mara',
    displayName: 'Māra Ozola',
    email: 'mara@example.com',
    avatarColor: '#FFC8DD',
    status: 'Online',
  },
  {
    id: 'demo-user-janis',
    displayName: 'Jānis Bērziņš',
    email: 'janis@example.com',
    avatarColor: '#FFD37D',
    status: 'Away',
  },
  {
    id: 'demo-user-elina',
    displayName: 'Elīna Kalniņa',
    email: 'elina@example.com',
    avatarColor: '#B5EAEA',
    status: 'Online',
  },
];

export function seedDemoContacts(firestore: DemoFirestore): void {
  const now = DemoTimestamp.now();

  CONTACTS.forEach((contact) => {
    const { id, ...rest } = contact;
    firestore.seed(`users/${id}`, {
      ...rest,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    });
  });
}
