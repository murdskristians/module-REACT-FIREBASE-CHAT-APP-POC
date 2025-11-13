import { storage } from './index';

export async function uploadConversationAttachment(
  conversationId: string,
  messageId: string,
  file: File
): Promise<string> {
  const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase();
  const storageRef = storage.ref(`conversations/${conversationId}/${messageId}-${sanitizedName}`);

  await storageRef.put(file);

  return storageRef.getDownloadURL();
}

