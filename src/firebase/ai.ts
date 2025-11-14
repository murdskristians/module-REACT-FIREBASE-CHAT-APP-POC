import OpenAI from 'openai';
import firebase from './index';
import { db } from './index';

const AI_CONVERSATIONS_COLLECTION = 'aiConversations';
const MESSAGES_SUBCOLLECTION = 'messages';

// Initialize Groq client (uses OpenAI-compatible API)
const groq = new OpenAI({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export type AiConversation = {
  id: string;
  userId: string;
  title: string;
  createdAt?: firebase.firestore.Timestamp | null;
  updatedAt?: firebase.firestore.Timestamp | null;
};

export type AiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: firebase.firestore.Timestamp | null;
};

/**
 * Create a new AI conversation
 */
export async function createAiConversation(
  userId: string,
  title: string = 'New Conversation'
): Promise<string> {
  const conversationRef = await db.collection(AI_CONVERSATIONS_COLLECTION).add({
    userId,
    title,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  return conversationRef.id;
}

/**
 * Subscribe to all AI conversations for a user
 */
export function subscribeToAiConversations(
  userId: string,
  callback: (conversations: AiConversation[]) => void
): firebase.Unsubscribe {
  return db
    .collection(AI_CONVERSATIONS_COLLECTION)
    .where('userId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        // Sort manually in JavaScript instead of Firestore query
        const conversations = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as AiConversation[];

        // Sort by updatedAt descending
        conversations.sort((a, b) => {
          const aTime = a.updatedAt?.toMillis() || 0;
          const bTime = b.updatedAt?.toMillis() || 0;
          return bTime - aTime;
        });

        callback(conversations);
      },
      (error) => {
        console.error('Error subscribing to AI conversations:', error);
      }
    );
}

/**
 * Subscribe to messages in an AI conversation
 */
export function subscribeToAiMessages(
  conversationId: string,
  callback: (messages: AiMessage[]) => void
): firebase.Unsubscribe {
  return db
    .collection(AI_CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .collection(MESSAGES_SUBCOLLECTION)
    .orderBy('createdAt', 'asc')
    .onSnapshot((snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AiMessage[];
      callback(messages);
    });
}

/**
 * Send a message to the AI and get a response
 * This calls OpenAI API directly from the client
 */
export async function sendAiMessage(
  conversationId: string,
  message: string
): Promise<void> {
  try {
    // Save user message to Firestore
    await db
      .collection(AI_CONVERSATIONS_COLLECTION)
      .doc(conversationId)
      .collection(MESSAGES_SUBCOLLECTION)
      .add({
        role: 'user',
        content: message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    // Update conversation metadata
    await db
      .collection(AI_CONVERSATIONS_COLLECTION)
      .doc(conversationId)
      .update({
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    // Fetch last 20 messages for context
    const messagesSnapshot = await db
      .collection(AI_CONVERSATIONS_COLLECTION)
      .doc(conversationId)
      .collection(MESSAGES_SUBCOLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    // Format messages for OpenAI (reverse to chronological order)
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> =
      messagesSnapshot.docs
        .reverse()
        .map((doc) => {
          const data = doc.data();
          return {
            role: data.role as 'user' | 'assistant',
            content: data.content,
          };
        });

    // Call Groq API (using llama-3.3-70b-versatile model - fast and free)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Be concise and friendly.',
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    // Save AI response to Firestore
    await db
      .collection(AI_CONVERSATIONS_COLLECTION)
      .doc(conversationId)
      .collection(MESSAGES_SUBCOLLECTION)
      .add({
        role: 'assistant',
        content: assistantMessage,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    // Update conversation with last message time
    await db
      .collection(AI_CONVERSATIONS_COLLECTION)
      .doc(conversationId)
      .update({
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
  } catch (error: any) {
    console.error('Error sending AI message:', error);
    throw new Error(error.message || 'Failed to send message to AI');
  }
}

/**
 * Delete an AI conversation and all its messages
 */
export async function deleteAiConversation(conversationId: string): Promise<void> {
  const batch = db.batch();

  // Delete all messages in the conversation
  const messagesSnapshot = await db
    .collection(AI_CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .collection(MESSAGES_SUBCOLLECTION)
    .get();

  messagesSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Delete the conversation itself
  batch.delete(db.collection(AI_CONVERSATIONS_COLLECTION).doc(conversationId));

  await batch.commit();
}

/**
 * Update AI conversation title
 */
export async function updateAiConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  await db.collection(AI_CONVERSATIONS_COLLECTION).doc(conversationId).update({
    title,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Generate a conversation title from the first user message
 */
export function generateConversationTitle(message: string): string {
  const maxLength = 50;
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength - 3) + '...';
}
