import firebase from './index';
import { db } from './index';
import { uploadConversationAttachment } from './storage';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_SUBCOLLECTION = 'messages';

export type Conversation = {
  id: string;
  title: string;
  subtitle?: string | null;
  avatarColor?: string | null;
  avatarUrl?: string | null;
  participants: string[];
  type: 'private' | 'direct' | 'group';
  isPinned?: boolean;
  isHidden?: boolean;
  updatedAt?: firebase.firestore.Timestamp | null;
  lastMessage?: ConversationMessagePreview | null;
};

export type ConversationMessagePreview = {
  text?: string | null;
  imageUrl?: string | null;
  senderId: string;
  senderName?: string | null;
  type: 'text' | 'image';
  createdAt?: firebase.firestore.Timestamp | null;
};

export type ConversationMessage = {
  id: string;
  senderId: string;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  senderAvatarColor?: string | null;
  text?: string | null;
  imageUrl?: string | null;
  type: 'text' | 'image';
  createdAt?: firebase.firestore.Timestamp | null;
};

export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): firebase.Unsubscribe {
  return db
    .collection(CONVERSATIONS_COLLECTION)
    .where('participants', 'array-contains', userId)
    .onSnapshot((snapshot) => {
      const conversations = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title ?? 'Untitled conversation',
            subtitle: data.subtitle ?? null,
            avatarColor: data.avatarColor ?? null,
            avatarUrl: data.avatarUrl ?? null,
            participants: data.participants ?? [],
            type: data.type ?? 'direct',
            isPinned: data.isPinned ?? false,
            isHidden: data.isHidden ?? false,
            updatedAt: data.updatedAt ?? null,
            lastMessage: data.lastMessage ?? null,
          } satisfies Conversation;
        })
        .sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() ?? 0;
          const bTime = b.updatedAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });

      callback(conversations);
    });
}

export function subscribeToConversationMessages(
  conversationId: string,
  callback: (messages: ConversationMessage[]) => void
): firebase.Unsubscribe {
  return db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .collection(MESSAGES_SUBCOLLECTION)
    .orderBy('createdAt', 'asc')
    .onSnapshot((snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName ?? null,
          senderAvatarUrl: data.senderAvatarUrl ?? null,
          senderAvatarColor: data.senderAvatarColor ?? null,
          text: data.text ?? null,
          imageUrl: data.imageUrl ?? null,
          type: data.type ?? 'text',
          createdAt: data.createdAt ?? null,
        } satisfies ConversationMessage;
      });

      callback(messages);
    });
}

type SendMessageOptions = {
  conversationId: string;
  senderId: string;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  senderAvatarColor?: string | null;
  text?: string;
  file?: File | null;
};

export async function sendMessage({
  conversationId,
  senderId,
  senderName,
  senderAvatarUrl,
  senderAvatarColor,
  text,
  file,
}: SendMessageOptions): Promise<void> {
  const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const messagesCollection = conversationRef.collection(MESSAGES_SUBCOLLECTION);

  const messageRef = messagesCollection.doc();

  let uploadedImageUrl: string | undefined;
  let messageType: 'text' | 'image' = 'text';

  if (file) {
    uploadedImageUrl = await uploadConversationAttachment(conversationId, messageRef.id, file);
    messageType = 'image';
  }

  const trimmedText = text?.trim();

  await messageRef.set({
    senderId,
    senderName: senderName ?? null,
    senderAvatarUrl: senderAvatarUrl ?? null,
    senderAvatarColor: senderAvatarColor ?? null,
    text: trimmedText ?? null,
    imageUrl: uploadedImageUrl ?? null,
    type: messageType,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  await conversationRef.set(
    {
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: {
        senderId,
        senderName: senderName ?? null,
        text: trimmedText ?? null,
        imageUrl: uploadedImageUrl ?? null,
        type: messageType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      isHidden: false, // Automatically unhide when sending/receiving messages
    },
    { merge: true }
  );
}

type EnsureConversationOptions = {
  participants: string[];
  title: string;
  subtitle?: string | null;
  avatarColor?: string | null;
  avatarUrl?: string | null;
};

export async function ensureConversationExists({
  participants,
  title,
  subtitle = null,
  avatarColor = null,
  avatarUrl = null,
}: EnsureConversationOptions): Promise<string> {
  const sortedParticipants = [...new Set(participants)].sort();

  try {
    // Simply create a new conversation
    // The check for existing conversations is done in the UI before calling this
    const conversationRef = await db.collection(CONVERSATIONS_COLLECTION).add({
      title,
      subtitle,
      avatarColor,
      avatarUrl,
      participants: sortedParticipants,
      type: 'direct',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: null,
    });

    return conversationRef.id;
  } catch (error) {
    throw error;
  }
}

export async function ensureSavedMessagesConversationExists(
  userId: string,
  userDisplayName: string,
  userAvatarColor: string,
  userAvatarUrl: string | null
): Promise<string> {
  const existingConversationsSnapshot = await db
    .collection(CONVERSATIONS_COLLECTION)
    .where('participants', 'array-contains', userId)
    .where('type', '==', 'private')
    .get();

  const existingPrivateConversation = existingConversationsSnapshot.docs.find(
    (doc) => {
      const data = doc.data();
      return (
        data.participants?.length === 1 &&
        data.participants[0] === userId
      );
    }
  );

  if (existingPrivateConversation) {
    // Ensure existing private conversation is pinned
    const existingData = existingPrivateConversation.data();
    if (!existingData.isPinned) {
      await existingPrivateConversation.ref.update({ isPinned: true });
    }
    return existingPrivateConversation.id;
  }

  const conversationRef = await db.collection(CONVERSATIONS_COLLECTION).add({
    title: 'Saved Messages',
    subtitle: null,
    avatarColor: userAvatarColor,
    avatarUrl: userAvatarUrl,
    participants: [userId],
    type: 'private',
    isPinned: true, // Always pinned
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastMessage: null,
  });

  return conversationRef.id;
}

export async function togglePinConversation(
  conversationId: string,
  isPinned: boolean
): Promise<void> {
  const conversationDoc = await db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .get();

  if (!conversationDoc.exists) {
    throw new Error('Conversation not found');
  }

  const conversationData = conversationDoc.data();
  if (conversationData?.type === 'private' && !isPinned) {
    // Prevent unpinning private conversations (Saved Messages)
    throw new Error('Cannot unpin private conversations');
  }

  await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).update({
    isPinned,
  });
}

export async function toggleHideConversation(
  conversationId: string,
  isHidden: boolean
): Promise<void> {
  const conversationDoc = await db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .get();

  if (!conversationDoc.exists) {
    throw new Error('Conversation not found');
  }

  const conversationData = conversationDoc.data();
  if (conversationData?.type === 'private') {
    // Prevent hiding private conversations (Saved Messages)
    throw new Error('Cannot hide private conversations');
  }

  await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).update({
    isHidden,
  });
}

type CreateGroupConversationOptions = {
  title: string;
  participants: string[];
  ownerId: string;
  avatarColor?: string | null;
  avatarUrl?: string | null;
};

export async function createGroupConversation({
  title,
  participants,
  ownerId,
  avatarColor = null,
  avatarUrl = null,
}: CreateGroupConversationOptions): Promise<string> {
  // Ensure owner is included in participants
  const allParticipants = [...new Set([ownerId, ...participants])].sort();

  const conversationRef = await db.collection(CONVERSATIONS_COLLECTION).add({
    title,
    subtitle: null,
    avatarColor,
    avatarUrl,
    participants: allParticipants,
    type: 'group',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastMessage: null,
    isPinned: false,
    isHidden: false,
  });

  return conversationRef.id;
}

