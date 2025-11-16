import { db, auth } from './index';
import type { SignallingMessage, CallRoom } from '../types/call';
import { CallMessageType } from '../types/call';
import firebase from 'firebase/compat/app';

const CALLS_COLLECTION = 'calls';
const CALL_ROOMS_COLLECTION = 'callRooms';
const CALL_MESSAGES_COLLECTION = 'callMessages';

export interface CreateCallRoomOptions {
  conversationId: string;
  participants: string[];
  group?: boolean;
}

export async function createCallRoom(options: CreateCallRoomOptions): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to create a call room');
  }

  const roomId = db.collection(CALL_ROOMS_COLLECTION).doc().id;
  const room: CallRoom = {
    id: roomId,
    conversationId: options.conversationId,
    participants: options.participants,
    group: options.group || false,
    createdAt: Date.now(),
  };

  await db.collection(CALL_ROOMS_COLLECTION).doc(roomId).set(room);
  return roomId;
}

export async function getCallRoom(roomId: string): Promise<CallRoom | null> {
  const doc = await db.collection(CALL_ROOMS_COLLECTION).doc(roomId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as CallRoom;
}

export async function endCallRoom(roomId: string): Promise<void> {
  await db.collection(CALL_ROOMS_COLLECTION).doc(roomId).update({
    endedAt: Date.now(),
  });
}

export async function sendCallMessage(message: SignallingMessage): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to send call messages');
  }

  const messageRef = db.collection(CALL_MESSAGES_COLLECTION).doc();
  await messageRef.set({
    ...message,
    id: messageRef.id,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export function subscribeToCallMessages(
  roomId: string,
  callback: (message: SignallingMessage) => void
): () => void {
  const unsubscribe = db
    .collection(CALL_MESSAGES_COLLECTION)
    .where('roomId', '==', roomId)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const message = change.doc.data() as SignallingMessage;
          callback(message);
        }
      });
    });

  return unsubscribe;
}

export function subscribeToIncomingCalls(
  userId: string,
  callback: (message: SignallingMessage) => void
): () => void {
  const CALL_INVITATION_TIMEOUT_MS = 60000; // 60 seconds - ignore invitations older than this
  
  const unsubscribe = db
    .collection(CALL_MESSAGES_COLLECTION)
    .where('type', '==', 'call-invitation')
    .where('recipientContactId', '==', userId)
    .onSnapshot(async (snapshot) => {
      // Process all changes and filter
      const changes = snapshot.docChanges();
      
      // Sort by timestamp descending (most recent first)
      const sortedChanges = changes
        .filter(change => change.type === 'added')
        .map(change => ({
          change,
          message: change.doc.data() as SignallingMessage,
        }))
        .sort((a, b) => {
          const timestampA = a.message.timestamp;
          const timestampB = b.message.timestamp;
          // Handle Firestore Timestamp objects
          const timeA = timestampA instanceof Object && 'toMillis' in timestampA 
            ? timestampA.toMillis() 
            : typeof timestampA === 'number' 
            ? timestampA 
            : Date.now();
          const timeB = timestampB instanceof Object && 'toMillis' in timestampB 
            ? timestampB.toMillis() 
            : typeof timestampB === 'number' 
            ? timestampB 
            : Date.now();
          return timeB - timeA; // Descending order
        });

      // Process only the most recent invitation
      if (sortedChanges.length > 0) {
        const { message } = sortedChanges[0];
        
        // Check if invitation is too old
        let messageTimestamp: number;
        if (message.timestamp instanceof Object && 'toMillis' in message.timestamp) {
          messageTimestamp = message.timestamp.toMillis();
        } else if (typeof message.timestamp === 'number') {
          messageTimestamp = message.timestamp;
        } else {
          // If timestamp is invalid, skip this message
          console.log('Invalid timestamp in call invitation:', message.timestamp);
          return;
        }
        
        const now = Date.now();
        const age = now - messageTimestamp;
        
        if (age > CALL_INVITATION_TIMEOUT_MS) {
          console.log('Ignoring old call invitation:', age, 'ms old');
          return;
        }
        
        // Check if room is still active
        if (message.roomId) {
          try {
            const room = await getCallRoom(message.roomId);
            if (!room || room.endedAt) {
              console.log('Ignoring call invitation for ended room:', message.roomId);
              return;
            }
          } catch (error) {
            console.error('Error checking room status:', error);
            // Continue processing if we can't check room status
          }
        }
        
        // Only process recent invitations
        callback(message);
      }
    });

  return unsubscribe;
}

export async function sendCallInvitation(
  roomId: string,
  conversationId: string,
  recipientId: string,
  senderId: string,
  isGroup: boolean
): Promise<void> {
  const room = await getCallRoom(roomId);
  if (!room) {
    throw new Error('Call room not found');
  }

  const message: SignallingMessage = {
    type: CallMessageType.CallInvitation,
    roomId,
    senderId,
    recipientContactId: recipientId,
    conversationId,
    group: isGroup,
    room,
    timestamp: Date.now(),
  };

  await sendCallMessage(message);
}

