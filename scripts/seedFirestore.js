/* eslint-disable @typescript-eslint/no-var-requires */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? path.resolve(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ Service account JSON not found. Provide FIREBASE_SERVICE_ACCOUNT_PATH or place serviceAccountKey.json next to this script.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
});

const db = admin.firestore();

const users = [
  {
    id: 'demo-user-1',
    displayName: 'Kristiāns Murds',
    email: 'kristians@example.com',
    avatarColor: '#FFD37D',
    status: 'Last seen recently',
  },
  {
    id: 'demo-user-2',
    displayName: 'Yan Latyshev',
    email: 'yan@example.com',
    avatarColor: '#A8D0FF',
    status: 'Online',
  },
];

const createUsers = () =>
  Promise.all(
    users.map((user) =>
      db
        .collection('users')
        .doc(user.id)
        .set(
          {
            displayName: user.displayName,
            email: user.email,
            avatarColor: user.avatarColor,
            status: user.status,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
    )
  );

const createConversation = async () => {
  const participants = [users[0].id, users[1].id].sort();
  const conversationRef = await db.collection('conversations').add({
    title: users[0].displayName,
    subtitle: users[0].status,
    participants,
    participantKey: participants.join('_'),
    avatarColor: users[0].avatarColor,
    avatarUrl: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: null,
  });

  await conversationRef.collection('messages').add({
    senderId: users[1].id,
    senderName: users[1].displayName,
    text: 'Welcome to the new FireChat experience!',
    imageUrl: null,
    type: 'text',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return conversationRef.id;
};

const run = async () => {
  try {
    console.log('📦 Seeding demo data...');
    await createUsers();
    const conversationId = await createConversation();
    console.log(`✅ Seed completed. Conversation id: ${conversationId}`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

run();

