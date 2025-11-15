import { storage, auth, db } from './index';
import firebase from 'firebase/compat/app';

export async function uploadConversationAttachment(
  conversationId: string,
  messageId: string,
  file: File
): Promise<string> {
  // Ensure user is authenticated
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to upload files');
  }

  // Verify that conversation exists and user is a participant
  try {
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      throw new Error('Conversation does not exist');
    }
    
    const conversationData = conversationDoc.data();
    if (!conversationData?.participants || !conversationData.participants.includes(currentUser.uid)) {
      throw new Error('User is not a participant of this conversation');
    }
  } catch (error) {
    console.error('Error verifying conversation access:', error);
    throw error;
  }

  const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase();
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const uniqueFileName = `${messageId}-${timestamp}-${randomId}-${sanitizedName}`;
  const storageRef = storage.ref(`conversations/${conversationId}/${uniqueFileName}`);

  // Create metadata with contentType to avoid CORS issues
  const metadata: firebase.storage.UploadMetadata = {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      originalName: file.name,
    },
  };

  try {
    await storageRef.put(file, metadata);
    const downloadURL = await storageRef.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

