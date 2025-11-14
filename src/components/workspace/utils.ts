import type { Contact } from '../../firebase/users';
import type { ViewConversation } from './Workspace';

export function createViewConversationFromContact(
  contact: Contact,
  conversationId: string,
  currentUserId: string
): ViewConversation {
  return {
    id: conversationId,
    title: contact.displayName ?? contact.email ?? 'Unknown User',
    subtitle: contact.email ?? contact.status ?? null,
    avatarColor: contact.avatarColor ?? '#A8D0FF',
    avatarUrl: contact.avatarUrl ?? null,
    participants: [currentUserId, contact.id],
    lastMessage: null,
    updatedAt: null,
    createdAt: null,
    displayTitle: contact.displayName ?? contact.email ?? 'Unknown User',
    displaySubtitle: contact.email ?? contact.status ?? '',
    displayAvatarUrl: contact.avatarUrl ?? null,
    displayAvatarColor: contact.avatarColor ?? '#A8D0FF',
    counterpartId: contact.id,
  };
}
