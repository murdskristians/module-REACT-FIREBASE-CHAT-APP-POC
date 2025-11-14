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
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: null,
    });

    return conversationRef.id;
  } catch (error) {
    throw error;
  }
}

