/**
 * Exercises the real src/firebase modules against the offline demo backend.
 *
 * These are the paths the portfolio build actually runs, so they cover the
 * Firestore behaviour the mock has to reproduce: subcollections, '=='  and
 * 'array-contains' filters, orderBy/limit, serverTimestamp, arrayUnion, and
 * live onSnapshot updates.
 */

export {};

// Must be set before src/firebase/index is first required.
process.env.REACT_APP_DEMO_MODE = 'true';

/* eslint-disable @typescript-eslint/no-var-requires, global-require */

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('offline demo mode', () => {
  let authModule: typeof import('../firebase/auth');
  let conversations: typeof import('../firebase/conversations');
  let users: typeof import('../firebase/users');
  let demoSeed: typeof import('../firebase/demoSeed');
  let guest: any;

  beforeAll(async () => {
    jest.resetModules();
    authModule = require('../firebase/auth');
    conversations = require('../firebase/conversations');
    users = require('../firebase/users');
    demoSeed = require('../firebase/demoSeed');

    const credential: any = await authModule.signInAnonymously();
    guest = credential.user;
  });

  it('signs a visitor in as a guest with no credentials', () => {
    expect(guest).toBeTruthy();
    expect(guest.isAnonymous).toBe(true);
    expect(authModule.getCurrentUser()).toBe(guest);
  });

  it('exposes seeded contacts through the real subscribe path', async () => {
    const seen: any[] = [];
    const unsubscribe = users.subscribeToContacts(guest.uid, (contacts) => {
      seen.push(contacts);
    });
    await flush();
    unsubscribe();

    const names = (seen.pop() ?? []).map((contact: any) => contact.displayName);
    expect(names).toContain('Demo Assistant');
    expect(names.length).toBeGreaterThanOrEqual(4);
  });

  it('seeds a demo conversation the guest participates in', async () => {
    await demoSeed.ensureDemoData(guest);

    const batches: any[] = [];
    const unsubscribe = conversations.subscribeToConversations(guest.uid, (list) => {
      batches.push(list);
    });
    await flush();
    unsubscribe();

    const latest = batches.pop() ?? [];
    // 'array-contains' on participants must match the guest.
    expect(latest.length).toBeGreaterThan(0);
    const demoConversation = latest.find((c: any) => c.title === 'Demo Assistant');
    expect(demoConversation).toBeTruthy();
    // serverTimestamp() resolved to a usable Timestamp.
    expect(typeof demoConversation.updatedAt?.toMillis()).toBe('number');
    // lastMessage denormalisation survived the write path.
    expect(demoConversation.lastMessage?.text).toContain('Real-time messaging');
  });

  it('delivers new messages to live listeners in order', async () => {
    const conversationId = await conversations.ensureConversationExists({
      participants: [guest.uid, 'demo-user-mara'],
      title: 'Māra Ozola',
    });

    const batches: any[][] = [];
    const unsubscribe = conversations.subscribeToConversationMessages(
      conversationId,
      (messages) => {
        batches.push(messages);
      }
    );
    await flush();
    expect(batches.pop()).toEqual([]); // initial snapshot fires immediately

    await conversations.sendMessage({
      conversationId,
      senderId: guest.uid,
      senderName: 'Guest',
      text: 'first',
    });
    await conversations.sendMessage({
      conversationId,
      senderId: 'demo-user-mara',
      senderName: 'Māra Ozola',
      text: 'second',
    });
    await flush();
    unsubscribe();

    const latest = batches.pop() ?? [];
    expect(latest.map((m: any) => m.text)).toEqual(['first', 'second']);
  });

  it('applies reactions through arrayUnion', async () => {
    const conversationId = await conversations.ensureConversationExists({
      participants: [guest.uid, 'demo-user-janis'],
      title: 'Jānis Bērziņš',
    });
    await conversations.sendMessage({
      conversationId,
      senderId: 'demo-user-janis',
      senderName: 'Jānis Bērziņš',
      text: 'react to me',
    });

    let messages: any[] = [];
    const unsubscribe = conversations.subscribeToConversationMessages(
      conversationId,
      (list) => {
        messages = list;
      }
    );
    await flush();

    await conversations.addReaction(conversationId, messages[0].id, '🔥', guest.uid);
    await flush();
    unsubscribe();

    expect(messages[0].reactions?.map((r: any) => r.emoji)).toContain('🔥');
  });

  it('stops sending the guest to a login screen', () => {
    // signOut must not strand the visitor: it hands back another guest.
    return authModule.signOut().then(() => {
      expect(authModule.getCurrentUser()?.isAnonymous).toBe(true);
    });
  });
});
