import firebase from './index';
import { db } from './index';

const CALL_SESSIONS_COLLECTION = 'callSessions';

export type CallType = 'audio' | 'video';

export type CallStatus =
  | 'initiating'   // Caller is setting up the call
  | 'ringing'      // Call is ringing for the receiver
  | 'accepted'     // Receiver accepted, establishing connection
  | 'active'       // Call is active and connected
  | 'ended'        // Call has ended
  | 'declined'     // Receiver declined the call
  | 'missed'       // Receiver didn't answer
  | 'failed';      // Call failed to connect

export type CallSession = {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string | null;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string | null;
  conversationId: string;
  type: CallType;
  status: CallStatus;
  createdAt?: firebase.firestore.Timestamp | null;
  updatedAt?: firebase.firestore.Timestamp | null;
  endedAt?: firebase.firestore.Timestamp | null;
};

export type SignalData = {
  id: string;
  callId: string;
  from: string;
  to: string;
  signal: any; // SimplePeer signal data
  createdAt?: firebase.firestore.Timestamp | null;
};

/**
 * Create a new call session
 */
export async function createCallSession(
  callerId: string,
  callerName: string,
  callerAvatar: string | null,
  receiverId: string,
  receiverName: string,
  receiverAvatar: string | null,
  conversationId: string,
  type: CallType
): Promise<string> {
  const callRef = await db.collection(CALL_SESSIONS_COLLECTION).add({
    callerId,
    callerName,
    callerAvatar,
    receiverId,
    receiverName,
    receiverAvatar,
    conversationId,
    type,
    status: 'initiating' as CallStatus,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  return callRef.id;
}

/**
 * Update call session status
 */
export async function updateCallStatus(
  callId: string,
  status: CallStatus
): Promise<void> {
  const updates: any = {
    status,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  if (status === 'ended' || status === 'declined' || status === 'missed' || status === 'failed') {
    updates.endedAt = firebase.firestore.FieldValue.serverTimestamp();
  }

  await db.collection(CALL_SESSIONS_COLLECTION).doc(callId).update(updates);
}

/**
 * Subscribe to a call session
 */
export function subscribeToCallSession(
  callId: string,
  callback: (session: CallSession | null) => void
): firebase.Unsubscribe {
  return db
    .collection(CALL_SESSIONS_COLLECTION)
    .doc(callId)
    .onSnapshot(
      (snapshot) => {
        if (snapshot.exists) {
          callback({
            id: snapshot.id,
            ...snapshot.data(),
          } as CallSession);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error subscribing to call session:', error);
        callback(null);
      }
    );
}

/**
 * Subscribe to incoming calls for a user
 */
export function subscribeToIncomingCalls(
  userId: string,
  callback: (calls: CallSession[]) => void
): firebase.Unsubscribe {
  return db
    .collection(CALL_SESSIONS_COLLECTION)
    .where('receiverId', '==', userId)
    .where('status', 'in', ['ringing', 'initiating'])
    .onSnapshot(
      (snapshot) => {
        const calls = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CallSession[];
        callback(calls);
      },
      (error) => {
        console.error('Error subscribing to incoming calls:', error);
        callback([]);
      }
    );
}

/**
 * Send WebRTC signaling data
 */
export async function sendSignal(
  callId: string,
  from: string,
  to: string,
  signal: any
): Promise<void> {
  await db
    .collection(CALL_SESSIONS_COLLECTION)
    .doc(callId)
    .collection('signals')
    .add({
      from,
      to,
      signal,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Subscribe to WebRTC signals for a user in a call
 */
export function subscribeToSignals(
  callId: string,
  userId: string,
  callback: (signal: SignalData) => void
): firebase.Unsubscribe {
  return db
    .collection(CALL_SESSIONS_COLLECTION)
    .doc(callId)
    .collection('signals')
    .where('to', '==', userId)
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const signalData = {
              id: change.doc.id,
              callId,
              ...change.doc.data(),
            } as SignalData;
            callback(signalData);
          }
        });
      },
      (error) => {
        console.error('Error subscribing to signals:', error);
      }
    );
}

/**
 * Delete old ended calls (cleanup)
 */
export async function cleanupOldCalls(): Promise<void> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const snapshot = await db
    .collection(CALL_SESSIONS_COLLECTION)
    .where('status', 'in', ['ended', 'declined', 'missed', 'failed'])
    .where('endedAt', '<', firebase.firestore.Timestamp.fromDate(oneDayAgo))
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
