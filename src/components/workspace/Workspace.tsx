import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type firebaseCompat from 'firebase/compat/app';

import './Workspace.css';

import { AppDock } from './AppDock';
import { ConversationList } from './ConversationList';
import { ChatView } from './chat/ChatView';
import { AiPanel } from './ai/AiPanel';
import { UserSearchModal } from './UserSearchModal';
import { createViewConversationFromContact as createViewConversationFromContactUtil } from './utils';
import { ContactCardView } from './contact/ContactCardView';
import {
  ensureConversationExists,
  sendMessage,
  subscribeToConversationMessages,
  subscribeToConversations,
  type Conversation,
  type ConversationMessage,
} from '../../firebase/conversations';
import {
  getUserById,
  subscribeToContacts,
  subscribeToUserProfile,
  type Contact,
} from '../../firebase/users';
import { MainPanelWrapper } from '../../pages/user-info/MainPanelWrapper';
import { PersonalInfo } from '../../pages/user-info/PersonalInfo';
import type { ProfileContact } from '../../types/profile';
import { theme } from '../../theme';

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
  const [currentUserProfile, setCurrentUserProfile] = useState<Contact | null>(
    null
  );
  const [activeApp, setActiveApp] = useState<'chat' | 'profile'>('chat');
  const [profileContact, setProfileContact] = useState<ProfileContact | null>(
    null
  );
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<Contact | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );

  const contactsMap = useMemo(() => {
    const map = new Map<string, Contact>();
    contacts.forEach((contact) => map.set(contact.id, contact));
    // Include current user's profile in the map
    if (currentUserProfile) {
      map.set(currentUserProfile.id, currentUserProfile);
    }
    return map;
  }, [contacts, currentUserProfile]);

  const createViewConversationFromContact = useCallback(
    (contact: Contact, conversationId: string): ViewConversation => {
      return createViewConversationFromContactUtil(
        contact,
        conversationId,
        user.uid
      );
    },
    [user.uid]
  );

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
      const isGroupConversation = conversation.participants.length > 2;
      const currentUserAvatarUrl = currentUserProfile?.avatarUrl ?? null;
      const displayAvatarUrl = isGroupConversation
        ? conversation.avatarUrl ?? null
        : counterpart?.avatarUrl ??
          (conversation.avatarUrl !== currentUserAvatarUrl
            ? conversation.avatarUrl
            : null) ??
          null;
      const displayAvatarColor =
        conversation.avatarColor ?? counterpart?.avatarColor ?? '#A8D0FF';

      return {
        ...conversation,
        displayTitle,
        displaySubtitle,
        displayAvatarUrl,
        displayAvatarColor,
        counterpartId,
      };
    },
    [contactsMap, user.uid, currentUserProfile]
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

    // First, get existing conversations that match
    const matchingConversations = viewConversations.filter((conversation) => {
      const lastMessageText = conversation.lastMessage?.text ?? '';
      return (
        conversation.displayTitle.toLowerCase().includes(term) ||
        lastMessageText.toLowerCase().includes(term)
      );
    });

    // Then, find contacts that match but don't have conversations
    const conversationUserIds = new Set(
      viewConversations.map((conv) => conv.counterpartId)
    );

    const matchingContactsWithoutConversations = contacts
      .filter((contact) => {
        // Skip if already has conversation
        if (conversationUserIds.has(contact.id)) return false;

        // Check if matches search
        const displayName = (contact.displayName || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        return displayName.includes(term) || email.includes(term);
      })
      .map((contact) =>
        createViewConversationFromContact(contact, `new_${contact.id}`)
      );

    return [...matchingConversations, ...matchingContactsWithoutConversations];
  }, [
    viewConversations,
    searchTerm,
    contacts,
    createViewConversationFromContact,
  ]);

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
    // Load current user's profile
    const loadUserProfile = async () => {
      const profile = await getUserById(user.uid);
      if (profile) {
        setCurrentUserProfile(profile);
      }
    };
    void loadUserProfile();
    setIsProfileLoading(true);
    const unsubscribe = subscribeToUserProfile(user.uid, (nextProfile) => {
      setProfileContact(nextProfile);
      setIsProfileLoading(false);
    });

    return unsubscribe;
  }, [user.uid]);

  // Removed auto-conversation creation to prevent clutter
  // Conversations will now be created only when the first message is sent

  useEffect(() => {
    // If we have a selected conversation ID but no conversations yet,
    // subscribe to it directly (handles newly created conversations)
    if (
      selectedConversationId &&
      !viewConversations.find((conv) => conv.id === selectedConversationId)
    ) {
      const unsubscribe = subscribeToConversationMessages(
        selectedConversationId,
        (messages) => {
          // We'll update the conversation details when the subscription updates
          setActiveConversationState((prev) => ({
            ...prev,
            messages,
          }));
        }
      );
      return unsubscribe;
    }

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
        const viewConv = buildViewConversation(conversation);
        setActiveConversationState({
          conversation: viewConv,
          messages,
        });
      }
    );

    return unsubscribe;
  }, [viewConversations, selectedConversationId, buildViewConversation]);

  const handleConversationSelect = (conversationId: string) => {
    // Check if this is a new user (not a real conversation)
    if (conversationId.startsWith('new_')) {
      const contactId = conversationId.replace('new_', '');
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        setPendingUser(contact);
        setSelectedConversationId(null);
        setActiveConversationState({
          conversation: null,
          messages: [],
        });
      }
      return;
    }

    const conversation = viewConversations.find(
      (conv) => conv.id === conversationId
    );

    if (!conversation || conversation.id === selectedConversationId) {
      return;
    }

    setSelectedConversationId(conversation.id);
    setPendingUser(null);
    setActiveConversationState({
      conversation,
      messages: [],
    });
    setSelectedContactId(null);
  };

  useEffect(() => {
    if (!selectedConversationId) {
      setActiveConversationState({ conversation: null, messages: [] });
    }
  }, [selectedConversationId]);

  const handleSelectApp = (app: 'chat' | 'profile') => {
    setActiveApp(app);
  };

  const handleOpenProfile = () => {
    setActiveApp('profile');
  };

  const handleUserSelect = useCallback(
    async (selectedUser: Contact) => {
      // Check if conversation already exists
      const existingConversation = conversations.find(
        (conv) =>
          conv.participants.includes(selectedUser.id) &&
          conv.participants.includes(user.uid)
      );

      if (existingConversation) {
        // Navigate to existing conversation
        setSelectedConversationId(existingConversation.id);
        setPendingUser(null);
      } else {
        // Set pending user for new conversation
        setPendingUser(selectedUser);
        setSelectedConversationId(null);
      }
    },
    [conversations, user.uid]
  );
  const handleContactClick = () => {
    const conversation = activeConversationState.conversation;
    if (conversation) {
      setSelectedContactId(conversation.counterpartId);
    }
  };

  const handleContactCardBack = () => {
    setSelectedContactId(null);
  };

  const handleContactCardClose = () => {
    setSelectedContactId(null);
  };

  const selectedContact = selectedContactId
    ? contactsMap.get(selectedContactId)
    : null;

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

    // Check if this is a pending conversation
    let conversationIdToUse = selectedConversationId;

    if (!selectedConversationId && pendingUser) {
      // First check if a conversation already exists
      const existingConversation = conversations.find((conv) => {
        const participants = conv.participants || [];
        return (
          participants.length === 2 &&
          participants.includes(pendingUser.id) &&
          participants.includes(user.uid)
        );
      });

      if (existingConversation) {
        conversationIdToUse = existingConversation.id;
        // Update selected conversation
        setSelectedConversationId(existingConversation.id);
        setPendingUser(null);
      } else {
        // Create conversation
        try {
          conversationIdToUse = await ensureConversationExists({
            participants: [user.uid, pendingUser.id],
            title:
              pendingUser.displayName ?? pendingUser.email ?? 'Unknown user',
            subtitle: pendingUser.status ?? pendingUser.email ?? null,
            avatarColor: pendingUser.avatarColor ?? '#A8D0FF',
            avatarUrl: pendingUser.avatarUrl ?? null,
          });

          const newConversation = createViewConversationFromContact(
            pendingUser,
            conversationIdToUse
          );

          // Set the active conversation state immediately
          setActiveConversationState({
            conversation: newConversation,
            messages: [],
          });

          // Set the new conversation ID and clear pending user
          setSelectedConversationId(conversationIdToUse);
          setPendingUser(null);

          // Don't return - continue to send the message
        } catch {
          setIsSending(false);
          return;
        }
      }
    }

    // Use the newly created conversation ID if it was just created, otherwise use the active conversation
    const conversationToSend = conversationIdToUse
      ? { id: conversationIdToUse }
      : activeConversationState.conversation;

    if (!conversationToSend) {
      return;
    }

    if (!text.trim() && !file) {
      return;
    }

    setIsSending(true);

    try {
      const userProfile = contactsMap.get(user.uid);
      await sendMessage({
        conversationId: conversationToSend.id,
        senderId: user.uid,
        senderName:
          userProfile?.displayName ??
          user.displayName ??
          user.email ??
          'Unknown user',
        senderAvatarUrl: userProfile?.avatarUrl ?? user.photoURL ?? null,
        senderAvatarColor: userProfile?.avatarColor ?? '#A8D0FF',
        text,
        file,
      });
    } catch {
      // Silently handle error
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MuiThemeProvider theme={theme}>
      <div className="workspace">
        <AppDock
          user={user}
          activeApp={activeApp}
          onSelectApp={handleSelectApp}
          onOpenProfile={handleOpenProfile}
        />

        {activeApp === 'profile' ? (
          <section className="workspace__profile-view">
            <MainPanelWrapper onSignOut={onSignOut}>
              <PersonalInfo
                profileContact={profileContact}
                isLoading={isProfileLoading}
              />
            </MainPanelWrapper>
          </section>
        ) : (
          <>
            <ConversationList
              conversations={filteredConversations}
              onSearchChange={setSearchTerm}
              searchTerm={searchTerm}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleConversationSelect}
              contactsMap={contactsMap}
              currentUserId={user.uid}
              onAddConversation={() => setShowUserSearchModal(true)}
            />
            <ChatView
              user={user}
              conversation={activeConversationState.conversation}
              messages={activeConversationState.messages}
              onSendMessage={handleSendMessage}
              isSending={isSending}
              contactsMap={contactsMap}
              pendingUser={pendingUser}
              onContactClick={handleContactClick}
            />
            {selectedContact && selectedContactId ? (
              <ContactCardView
                contact={selectedContact}
                onBack={handleContactCardBack}
                onClose={handleContactCardClose}
              />
            ) : (
              <AiPanel />
            )}
          </>
        )}
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        showModal={showUserSearchModal}
        setShowModal={setShowUserSearchModal}
        contacts={contacts}
        conversations={conversations}
        currentUserId={user.uid}
        onUserSelect={handleUserSelect}
        isLoading={false}
      />
    </MuiThemeProvider>
  );
}
