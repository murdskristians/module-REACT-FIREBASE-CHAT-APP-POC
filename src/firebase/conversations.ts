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

export type MessageReaction = {
  id: string;
  reactedBy: string;
  emoji: string;
  reactedAt?: firebase.firestore.Timestamp | null;
};

export type MessageReply = {
  messageId: string;
  senderId: string;
  senderName?: string | null;
  text?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null; // For video/audio files
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  createdAt?: firebase.firestore.Timestamp | null;
};

export type MessageForward = {
  originalMessageId: string;
  originalConversationId: string;
  originalSenderId: string;
  originalSenderName?: string | null;
  originalText?: string | null;
  originalImageUrl?: string | null;
  originalFileUrls?: string[] | null;
  originalAudioUrl?: string | null;
  originalAudioDuration?: number | null;
  originalAudioVolumeLevels?: number[] | null;
  originalType: 'text' | 'image' | 'file' | 'audio' | 'video';
  originalCreatedAt?: firebase.firestore.Timestamp | null;
};

export type ConversationMessage = {
  id: string;
  senderId: string;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  senderAvatarColor?: string | null;
  text?: string | null;
  imageUrl?: string | null;
  fileUrls?: string[] | null;
  audioUrl?: string | null;
  audioDuration?: number | null;
  audioVolumeLevels?: number[] | null;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  createdAt?: firebase.firestore.Timestamp | null;
  isPinned?: boolean;
  pinnedBy?: string | null;
  pinnedAt?: firebase.firestore.Timestamp | null;
  reactions?: MessageReaction[];
  replyTo?: MessageReply | null;
  forwardedFrom?: MessageForward | null;
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
        const reactions = data.reactions ? (Array.isArray(data.reactions) ? data.reactions : []) : [];
        return {
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName ?? null,
          senderAvatarUrl: data.senderAvatarUrl ?? null,
          senderAvatarColor: data.senderAvatarColor ?? null,
          text: data.text ?? null,
          imageUrl: data.imageUrl ?? null,
          fileUrls: data.fileUrls ?? null,
          audioUrl: data.audioUrl ?? null,
          audioDuration: data.audioDuration ?? null,
          audioVolumeLevels: data.audioVolumeLevels ?? null,
          type: data.type ?? 'text',
          createdAt: data.createdAt ?? null,
          isPinned: data.isPinned ?? false,
          pinnedBy: data.pinnedBy ?? null,
          pinnedAt: data.pinnedAt ?? null,
          reactions: reactions.map((r: any) => ({
            id: r.id || doc.id + '_' + r.reactedBy + '_' + r.emoji,
            reactedBy: r.reactedBy,
            emoji: r.emoji,
            reactedAt: r.reactedAt ?? null,
          })) as MessageReaction[],
          replyTo: data.replyTo ? {
            messageId: data.replyTo.messageId,
            senderId: data.replyTo.senderId,
            senderName: data.replyTo.senderName ?? null,
            text: data.replyTo.text ?? null,
            imageUrl: data.replyTo.imageUrl ?? null,
            fileUrl: data.replyTo.fileUrl ?? null,
            type: data.replyTo.type ?? 'text',
            createdAt: data.replyTo.createdAt ?? null,
          } : null,
          forwardedFrom: data.forwardedFrom ? {
            originalMessageId: data.forwardedFrom.originalMessageId,
            originalConversationId: data.forwardedFrom.originalConversationId,
            originalSenderId: data.forwardedFrom.originalSenderId,
            originalSenderName: data.forwardedFrom.originalSenderName ?? null,
            originalText: data.forwardedFrom.originalText ?? null,
            originalImageUrl: data.forwardedFrom.originalImageUrl ?? null,
            originalFileUrls: data.forwardedFrom.originalFileUrls ?? null,
            originalAudioUrl: data.forwardedFrom.originalAudioUrl ?? null,
            originalAudioDuration: data.forwardedFrom.originalAudioDuration ?? null,
            originalAudioVolumeLevels: data.forwardedFrom.originalAudioVolumeLevels ?? null,
            originalType: data.forwardedFrom.originalType ?? 'text',
            originalCreatedAt: data.forwardedFrom.originalCreatedAt ?? null,
          } : null,
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
  files?: File[];
  audio?: { blob: Blob; duration: number; volumeLevels: number[] };
  replyTo?: MessageReply | null;
  forwardedFrom?: MessageForward | null;
};

export async function sendMessage({
  conversationId,
  senderId,
  senderName,
  senderAvatarUrl,
  senderAvatarColor,
  text,
  file,
  files,
  audio,
  replyTo,
  forwardedFrom,
}: SendMessageOptions): Promise<void> {
  const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const messagesCollection = conversationRef.collection(MESSAGES_SUBCOLLECTION);

  const messageRef = messagesCollection.doc();

  let uploadedImageUrl: string | undefined;
  let uploadedFileUrls: string[] = [];
  let uploadedAudioUrl: string | undefined;
  let messageType: 'text' | 'image' | 'file' | 'audio' | 'video' = 'text';

  // Support legacy single file parameter
  const filesToUpload = files || (file ? [file] : []);

  if (filesToUpload.length > 0) {
    // Check if there are audio files that should be treated as voice messages
    const audioFiles = filesToUpload.filter(f => 
      f.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)$/i.test(f.name)
    );
    const nonAudioFiles = filesToUpload.filter(f => 
      !f.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)$/i.test(f.name)
    );

    // If there are audio files and no separate audio blob, treat first audio file as voice message
    if (audioFiles.length > 0 && !audio) {
      const firstAudioFile = audioFiles[0];
      uploadedAudioUrl = await uploadConversationAttachment(conversationId, messageRef.id, firstAudioFile);
      messageType = 'audio';
      
      // Upload non-audio files if any
      if (nonAudioFiles.length > 0) {
        uploadedFileUrls = await Promise.all(
          nonAudioFiles.map(f => uploadConversationAttachment(conversationId, messageRef.id, f))
        );
        // Determine type for non-audio files
        const firstNonAudioFile = nonAudioFiles[0];
        if (firstNonAudioFile.type.startsWith('image/')) {
          uploadedImageUrl = uploadedFileUrls[0];
        }
      }
    } else {
      // Upload all files normally
      uploadedFileUrls = await Promise.all(
        filesToUpload.map(f => uploadConversationAttachment(conversationId, messageRef.id, f))
      );
      
      // Determine message type based on first file
      const firstFile = filesToUpload[0];
      if (firstFile.type.startsWith('image/')) {
        messageType = 'image';
        uploadedImageUrl = uploadedFileUrls[0]; // For backward compatibility
      } else if (firstFile.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)$/i.test(firstFile.name)) {
        messageType = 'video';
      } else if (firstFile.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus)$/i.test(firstFile.name)) {
        messageType = 'audio';
        uploadedAudioUrl = uploadedFileUrls[0]; // Use first file as audio URL
      } else {
        messageType = 'file';
      }
    }
  }

  // Upload audio if present (from voice recording or processed audio file)
  if (audio) {
    const audioFile = new File([audio.blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
    uploadedAudioUrl = await uploadConversationAttachment(conversationId, messageRef.id, audioFile);
    messageType = 'audio';
  }

  const trimmedText = text?.trim();

  // If forwarding, use original fileUrls from forwardedFrom
  const finalFileUrls = forwardedFrom?.originalFileUrls && forwardedFrom.originalFileUrls.length > 0
    ? forwardedFrom.originalFileUrls
    : (uploadedFileUrls.length > 0 ? uploadedFileUrls : null);
  
  // If forwarding, use original imageUrl from forwardedFrom
  const finalImageUrl = forwardedFrom?.originalImageUrl
    ? forwardedFrom.originalImageUrl
    : uploadedImageUrl;
  
  // If forwarding, use original audioUrl from forwardedFrom
  const finalAudioUrl = forwardedFrom?.originalAudioUrl
    ? forwardedFrom.originalAudioUrl
    : (forwardedFrom?.originalFileUrls && forwardedFrom.originalFileUrls.length > 0 && forwardedFrom.originalType === 'audio'
      ? forwardedFrom.originalFileUrls[0]
      : uploadedAudioUrl);
  
  // If forwarding, preserve original type
  const finalMessageType = forwardedFrom?.originalType || messageType;
  
  // If forwarding audio, preserve original audio metadata
  const finalAudioDuration = forwardedFrom?.originalType === 'audio' && forwardedFrom.originalAudioDuration
    ? forwardedFrom.originalAudioDuration
    : (audio?.duration ?? null);
  
  const finalAudioVolumeLevels = forwardedFrom?.originalType === 'audio' && forwardedFrom.originalAudioVolumeLevels
    ? forwardedFrom.originalAudioVolumeLevels
    : (audio?.volumeLevels ?? null);

  await messageRef.set({
    senderId,
    senderName: senderName ?? null,
    senderAvatarUrl: senderAvatarUrl ?? null,
    senderAvatarColor: senderAvatarColor ?? null,
    text: trimmedText ?? null,
    imageUrl: finalImageUrl ?? null,
    fileUrls: finalFileUrls,
    audioUrl: finalAudioUrl ?? null,
    audioDuration: finalAudioDuration,
    audioVolumeLevels: finalAudioVolumeLevels,
    type: finalMessageType,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    replyTo: replyTo ? {
      messageId: replyTo.messageId,
      senderId: replyTo.senderId,
      senderName: replyTo.senderName ?? null,
      text: replyTo.text ?? null,
      imageUrl: replyTo.imageUrl ?? null,
      fileUrl: replyTo.fileUrl ?? null,
      type: replyTo.type,
      createdAt: replyTo.createdAt ?? null,
    } : null,
    forwardedFrom: forwardedFrom ? {
      originalMessageId: forwardedFrom.originalMessageId,
      originalConversationId: forwardedFrom.originalConversationId,
      originalSenderId: forwardedFrom.originalSenderId,
      originalSenderName: forwardedFrom.originalSenderName ?? null,
      originalText: forwardedFrom.originalText ?? null,
      originalImageUrl: forwardedFrom.originalImageUrl ?? null,
      originalFileUrls: forwardedFrom.originalFileUrls ?? null,
      originalAudioUrl: forwardedFrom.originalAudioUrl ?? null,
      originalAudioDuration: forwardedFrom.originalAudioDuration ?? null,
      originalAudioVolumeLevels: forwardedFrom.originalAudioVolumeLevels ?? null,
      originalType: forwardedFrom.originalType,
      originalCreatedAt: forwardedFrom.originalCreatedAt ?? null,
    } : null,
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

type ForwardMessageOptions = {
  message: ConversationMessage;
  originalConversationId: string;
  targetConversationIds: string[];
  forwardText?: string;
  senderId: string;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  senderAvatarColor?: string | null;
  contactsMap: Map<string, { displayName?: string | null; email?: string | null; avatarColor?: string | null; avatarUrl?: string | null }>;
};

export async function forwardMessage({
  message,
  originalConversationId,
  targetConversationIds,
  forwardText,
  senderId,
  senderName,
  senderAvatarUrl,
  senderAvatarColor,
  contactsMap,
}: ForwardMessageOptions): Promise<string[]> {
  if (targetConversationIds.length === 0) {
    throw new Error('No target conversations specified');
  }

  // Create forward relation data
  const forwardedFrom: MessageForward = {
    originalMessageId: message.id,
    originalConversationId: originalConversationId,
    originalSenderId: message.senderId,
    originalSenderName: message.senderName ?? null,
    originalText: message.text ?? null,
    originalImageUrl: message.imageUrl ?? null,
    originalFileUrls: message.fileUrls ?? null,
    originalAudioUrl: message.audioUrl ?? null,
    originalAudioDuration: message.audioDuration ?? null,
    originalAudioVolumeLevels: message.audioVolumeLevels ?? null,
    originalType: message.type,
    originalCreatedAt: message.createdAt ?? null,
  };

  const finalConversationIds: string[] = [];

  // Forward to each target conversation
  for (const targetConversationId of targetConversationIds) {
    // Check if conversation exists by ID
    const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(targetConversationId);
    const conversationDoc = await conversationRef.get();

    let finalConversationId = targetConversationId;

    // If conversation doesn't exist by ID, it might be a contact ID
    if (!conversationDoc.exists) {
      const contact = contactsMap.get(targetConversationId);
      if (!contact) {
        throw new Error(`Contact not found: ${targetConversationId}`);
      }

      // First, try to find existing conversation between sender and target contact
      // Query conversations where both participants are present
      const existingConversationsQuery = await db
        .collection(CONVERSATIONS_COLLECTION)
        .where('participants', 'array-contains', senderId)
        .where('type', '==', 'direct')
        .get();

      // Filter to find conversation with exactly these two participants
      const existingConversation = existingConversationsQuery.docs.find((doc) => {
        const data = doc.data();
        const participants = data.participants || [];
        return (
          participants.length === 2 &&
          participants.includes(senderId) &&
          participants.includes(targetConversationId)
        );
      });

      if (existingConversation) {
        // Use existing conversation
        finalConversationId = existingConversation.id;
      } else {
        // Create new conversation only if it doesn't exist
        const newConversationId = await ensureConversationExists({
          participants: [senderId, targetConversationId],
          title: contact.displayName ?? contact.email ?? 'Unknown',
          subtitle: null,
          avatarColor: contact.avatarColor ?? null,
          avatarUrl: contact.avatarUrl ?? null,
        });

        finalConversationId = newConversationId;
      }
    }

    // Send the forwarded message
    await sendMessage({
      conversationId: finalConversationId,
      senderId,
      senderName,
      senderAvatarUrl,
      senderAvatarColor,
      text: forwardText?.trim() || null,
      file: null,
      replyTo: null,
      forwardedFrom,
    });

    finalConversationIds.push(finalConversationId);
  }

  return finalConversationIds;
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

export async function pinMessage(
  conversationId: string,
  messageId: string,
  currentUserId: string
): Promise<void> {
  const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const messageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc(messageId);

  const messageDoc = await messageRef.get();
  if (!messageDoc.exists) {
    throw new Error('Message not found');
  }

  await messageRef.update({
    isPinned: true,
    pinnedBy: currentUserId,
    pinnedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export async function unpinMessage(
  conversationId: string,
  messageId: string,
  currentUserId: string
): Promise<void> {
  const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const messageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc(messageId);

  const messageDoc = await messageRef.get();
  if (!messageDoc.exists) {
    throw new Error('Message not found');
  }

  const messageData = messageDoc.data();
  // Allow unpinning if user is the one who pinned it or if it's pinned by anyone (for simplicity)
  // In a real app, you might want to check permissions here
  if (messageData?.isPinned) {
    await messageRef.update({
      isPinned: false,
      pinnedBy: null,
      pinnedAt: null,
    });
  }
}

export async function addReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
  currentUserId: string
): Promise<void> {
  const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const messageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc(messageId);

  const messageDoc = await messageRef.get();
  if (!messageDoc.exists) {
    throw new Error('Message not found');
  }

  const messageData = messageDoc.data();
  const existingReactions = (messageData?.reactions || []) as MessageReaction[];
  
  // Check if user already reacted with this emoji
  const existingReaction = existingReactions.find(
    (r) => r.reactedBy === currentUserId && r.emoji === emoji
  );

  if (existingReaction) {
    // User already reacted with this emoji, remove it (toggle off)
    await removeReaction(conversationId, messageId, emoji, currentUserId);
    return;
  }

  // Add new reaction
  const newReaction: MessageReaction = {
    id: `${messageId}_${currentUserId}_${emoji}_${Date.now()}`,
    reactedBy: currentUserId,
    emoji: emoji,
    reactedAt: firebase.firestore.Timestamp.now(),
  };

  await messageRef.update({
    reactions: firebase.firestore.FieldValue.arrayUnion(newReaction),
  });
}

export async function removeReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
  currentUserId: string
): Promise<void> {
  const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const messageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc(messageId);

  const messageDoc = await messageRef.get();
  if (!messageDoc.exists) {
    throw new Error('Message not found');
  }

  const messageData = messageDoc.data();
  const existingReactions = (messageData?.reactions || []) as MessageReaction[];
  
  // Find the reaction to remove
  const reactionToRemove = existingReactions.find(
    (r) => r.reactedBy === currentUserId && r.emoji === emoji
  );

  if (reactionToRemove) {
    await messageRef.update({
      reactions: firebase.firestore.FieldValue.arrayRemove(reactionToRemove),
    });
  }
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
  currentUserId: string
): Promise<void> {
  const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
  const messageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc(messageId);

  // Get the message before deleting to check if it's the last message
  const messageDoc = await messageRef.get();
  const messageData = messageDoc.data();

  // Check if message exists
  if (!messageDoc.exists || !messageData) {
    throw new Error('Message not found');
  }

  // Check if current user is the sender of the message
  if (messageData.senderId !== currentUserId) {
    throw new Error('You can only delete your own messages');
  }

  // Delete the message
  await messageRef.delete();

  // Check if the deleted message was the last message
  if (messageData) {
    const conversationDoc = await conversationRef.get();
    const conversationData = conversationDoc.data();
    const lastMessage = conversationData?.lastMessage;

    // If the deleted message matches the last message, update lastMessage
    if (
      lastMessage &&
      lastMessage.senderId === messageData.senderId &&
      lastMessage.text === messageData.text &&
      lastMessage.imageUrl === messageData.imageUrl
    ) {
      // Get the new last message
      const messagesSnapshot = await conversationRef
        .collection(MESSAGES_SUBCOLLECTION)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (messagesSnapshot.empty) {
        // No messages left, set lastMessage to null
        await conversationRef.update({
          lastMessage: null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Update lastMessage to the new last message
        const newLastMessageDoc = messagesSnapshot.docs[0];
        const newLastMessageData = newLastMessageDoc.data();
        await conversationRef.update({
          lastMessage: {
            senderId: newLastMessageData.senderId,
            senderName: newLastMessageData.senderName ?? null,
            text: newLastMessageData.text ?? null,
            imageUrl: newLastMessageData.imageUrl ?? null,
            type: newLastMessageData.type ?? 'text',
            createdAt: newLastMessageData.createdAt ?? null,
          },
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }
}

