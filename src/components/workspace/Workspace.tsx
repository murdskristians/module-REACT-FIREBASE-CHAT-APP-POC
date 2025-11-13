import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type firebaseCompat from 'firebase/compat/app';

import './Workspace.css';

import { AppDock } from './AppDock';
import { ConversationList } from './ConversationList';
import { ChatView } from './chat/ChatView';
import { AiPanel } from './ai/AiPanel';
import {
  ensureConversationExists,
  sendMessage,
  subscribeToConversationMessages,
  subscribeToConversations,
  type Conversation,
  type ConversationMessage,
} from '../../firebase/conversations';
import { subscribeToContacts, type Contact } from '../../firebase/users';

type WorkspaceProps = {
  user: firebaseCompat.User;
  onSignOut: () => Promise<void> | void;
};

export type ViewConversation = Conversation & {
  displayTitle: string;
  displaySubtitle: string;
  displayAvatarUrl: string | null;
  displayAvatarColor: string | null;
  counterpartId: string;
};

type ActiveConversationState = {
  conversation: ViewConversation | null;
  messages: ConversationMessage[];
};

export function Workspace({ user, onSignOut }: WorkspaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationState, setActiveConversationState] =
    useState<ActiveConversationState>({
      conversation: null,
      messages: [],
    });
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const ensuredContactsRef = useRef<Set<string>>(new Set());

  const contactsMap = useMemo(() => {
    const map = new Map<string, Contact>();
    contacts.forEach((contact) => map.set(contact.id, contact));
    return map;
  }, [contacts]);

  const buildViewConversation = useCallback(
    (conversation: Conversation): ViewConversation => {
      const counterpartId =
        conversation.participants.find((id) => id !== user.uid) ??
        conversation.participants[0] ??
        user.uid;
      const counterpart = contactsMap.get(counterpartId);

      const displayTitle =
        counterpart?.displayName ??
        counterpart?.email ??
        conversation.title ??
        'Conversation';
      const displaySubtitle =
        counterpart?.status ??
        conversation.subtitle ??
        counterpart?.email ??
        'Last seen recently';
      const displayAvatarUrl =
        counterpart?.avatarUrl ?? conversation.avatarUrl ?? null;
      const displayAvatarColor =
        counterpart?.avatarColor ?? conversation.avatarColor ?? '#A8D0FF';

      return {
        ...conversation,
        displayTitle,
        displaySubtitle,
        displayAvatarUrl,
        displayAvatarColor,
        counterpartId,
      };
    },
    [contactsMap, user.uid]
  );

  const viewConversations = useMemo<ViewConversation[]>(() => {
    return conversations.map((conversation) =>
      buildViewConversation(conversation)
    );
  }, [conversations, buildViewConversation]);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return viewConversations;
    }

    return viewConversations.filter((conversation) => {
      const lastMessageText = conversation.lastMessage?.text ?? '';

      return (
        conversation.displayTitle.toLowerCase().includes(term) ||
        lastMessageText.toLowerCase().includes(term)
      );
    });
  }, [viewConversations, searchTerm]);

  useEffect(() => {
    const unsubscribe = subscribeToConversations(
      user.uid,
      (nextConversations) => {
        setConversations(nextConversations);
      }
    );

    return unsubscribe;
  }, [user.uid]);

  useEffect(() => {
    const unsubscribe = subscribeToContacts(user.uid, (nextContacts) => {
      setContacts(nextContacts);
    });

    return unsubscribe;
  }, [user.uid]);

  useEffect(() => {
    if (!contacts.length) {
      return;
    }

    const ensureConversations = async () => {
      await Promise.all(
        contacts.map(async (contact) => {
          if (!contact.id || ensuredContactsRef.current.has(contact.id)) {
            return;
          }

          ensuredContactsRef.current.add(contact.id);

          try {
            const conversationId = await ensureConversationExists({
              participants: [user.uid, contact.id],
              title: contact.displayName ?? contact.email ?? 'Unknown user',
              subtitle: contact.status ?? contact.email ?? null,
              avatarColor: contact.avatarColor ?? '#A8D0FF',
              avatarUrl: contact.avatarUrl ?? null,
            });

            if (!selectedConversationId) {
              setSelectedConversationId(conversationId);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to ensure conversation', error);
          }
        })
      );
    };

    void ensureConversations();
  }, [contacts, user.uid, selectedConversationId]);

  useEffect(() => {
    if (!viewConversations.length) {
      setActiveConversationState({ conversation: null, messages: [] });
      return undefined;
    }

    const desiredConversation =
      selectedConversationId &&
      viewConversations.find((conv) => conv.id === selectedConversationId);

    const conversation =
      desiredConversation ??
      (selectedConversationId ? null : viewConversations[0]);

    if (!conversation) {
      setActiveConversationState({ conversation: null, messages: [] });
      return undefined;
    }

    const unsubscribe = subscribeToConversationMessages(
      conversation.id,
      (messages) => {
        setActiveConversationState({
          conversation: buildViewConversation(conversation),
          messages,
        });
      }
    );

    return unsubscribe;
  }, [viewConversations, selectedConversationId, buildViewConversation]);

  const handleConversationSelect = (conversationId: string) => {
    const conversation = viewConversations.find(
      (conv) => conv.id === conversationId
    );

    if (!conversation || conversation.id === selectedConversationId) {
      return;
    }

    setSelectedConversationId(conversation.id);
    setActiveConversationState({
      conversation,
      messages: [],
    });
  };

  useEffect(() => {
    if (!selectedConversationId) {
      setActiveConversationState({ conversation: null, messages: [] });
    }
  }, [selectedConversationId]);

  const handleSendMessage = async ({
    text,
    file,
  }: {
    text: string;
    file?: File | null;
  }) => {
    if (isSending) {
      return;
    }

    const conversationToSend = activeConversationState.conversation;

    if (!conversationToSend) {
      return;
    }

    if (!text.trim() && !file) {
      return;
    }

    setIsSending(true);

    try {
      await sendMessage({
        conversationId: conversationToSend.id,
        senderId: user.uid,
        senderName: user.displayName ?? user.email ?? 'Unknown user',
        text,
        file,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="workspace">
      <AppDock user={user} onSignOut={onSignOut} />

      <ConversationList
        conversations={filteredConversations}
        onSearchChange={setSearchTerm}
        searchTerm={searchTerm}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleConversationSelect}
        contactsMap={contactsMap}
        currentUserId={user.uid}
      />

      <ChatView
        user={user}
        conversation={activeConversationState.conversation}
        messages={activeConversationState.messages}
        onSendMessage={handleSendMessage}
        isSending={isSending}
      />

      <AiPanel />
    </div>
  );
}
