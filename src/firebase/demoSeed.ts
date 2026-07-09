import type { FirebaseUser } from './auth';
import { db } from './index';
import { upsertUserProfile } from './users';
import { ensureConversationExists, sendMessage } from './conversations';

// A fixed "other participant" for the demo conversation. It has no user doc of
// its own (name/colour are denormalised onto the conversation and messages),
// which is fine because Firestore rules only require the current user to be a
// participant when writing.
const DEMO_BOT_ID = 'demo-assistant';
const DEMO_BOT_NAME = 'Demo Assistant';
const DEMO_BOT_COLOR = '#A8D0FF';

// Guard against double-seeding within a session (React StrictMode re-invokes,
// repeated auth events, etc.).
const seededUids = new Set<string>();

/**
 * For anonymous demo visitors: create their profile and, on first visit, seed a
 * small pre-populated conversation so the chat isn't an empty shell.
 */
export async function ensureDemoData(user: FirebaseUser): Promise<void> {
  if (seededUids.has(user.uid)) return;
  seededUids.add(user.uid);

  try {
    // Guest's own profile (+ pinned "Saved Messages" conversation).
    await upsertUserProfile(user);

    // Skip if this guest already has the demo conversation.
    const snapshot = await db
      .collection('conversations')
      .where('participants', 'array-contains', user.uid)
      .get();
    const alreadySeeded = snapshot.docs.some((doc) =>
      (doc.data().participants ?? []).includes(DEMO_BOT_ID)
    );
    if (alreadySeeded) return;

    const guestName = user.displayName ?? 'Guest';

    const conversationId = await ensureConversationExists({
      participants: [user.uid, DEMO_BOT_ID],
      title: DEMO_BOT_NAME,
      subtitle: 'Online',
      avatarColor: DEMO_BOT_COLOR,
      avatarUrl: null,
    });

    const script: Array<{ from: 'bot' | 'guest'; text: string }> = [
      { from: 'bot', text: `👋 Hi ${guestName}! Welcome to FireChat — a real-time chat app built with React + Firebase.` },
      { from: 'bot', text: 'This is a live demo conversation. Try sending a message, adding a reaction, or replying to one of these.' },
      { from: 'guest', text: 'Nice! What can it do?' },
      { from: 'bot', text: 'Real-time messaging, image/file/voice attachments, reactions, replies, pinned messages and calls. Feel free to explore. 🚀' },
    ];

    for (const line of script) {
      await sendMessage({
        conversationId,
        senderId: line.from === 'bot' ? DEMO_BOT_ID : user.uid,
        senderName: line.from === 'bot' ? DEMO_BOT_NAME : guestName,
        senderAvatarColor: line.from === 'bot' ? DEMO_BOT_COLOR : null,
        text: line.text,
      });
    }
  } catch (err) {
    // Non-fatal — the app still works without seed data.
    // eslint-disable-next-line no-console
    console.error('Demo seed failed:', err);
  }
}
