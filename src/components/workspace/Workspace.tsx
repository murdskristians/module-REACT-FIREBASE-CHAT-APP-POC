import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
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
import {
  subscribeToContacts,
  subscribeToUserProfile,
  type Contact,
  type UserProfile,
} from '../../firebase/users';
import type { ProfileContact } from '../../types/profile';
import { MainPanelWrapper } from '../../pages/user-info/MainPanelWrapper';
import { PersonalInfo } from '../../pages/user-info/PersonalInfo';
import { defaultTheme } from 'piche.ui';

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
  const [activeApp, setActiveApp] = useState<'chat' | 'profile'>('chat');
  const [profileContact, setProfileContact] = useState<ProfileContact | null>(
    null
  );
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const ensuredContactsRef = useRef<Set<string>>(new Set());
  const profileTheme = useMemo(() => createTheme(defaultTheme), []);

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

  const buildProfileContact = useCallback(
    (profile: UserProfile | null): ProfileContact => {
      const name =
        profile?.displayName ??
        user.displayName ??
        user.email ??
        'Unknown user';
      const email = profile?.email ?? user.email ?? '';

      const additionalEmails = profile?.additionalEmails?.length
        ? profile.additionalEmails
        : email
        ? [
            {
              id: 'primary-email',
              label: 'Primary',
              email,
            },
          ]
        : [];

      const phoneNumbers = profile?.phoneNumbers?.length
        ? profile.phoneNumbers
        : [
            {
              id: 'mobile-phone',
              label: 'Mobile',
              phone: '+371 2000 0000',
            },
          ];

      return {
        id: user.uid,
        name,
        email,
        avatarUrl: profile?.avatarUrl ?? user.photoURL ?? null,
        avatarColor: profile?.avatarColor ?? '#A8D0FF',
        statusMessage: profile?.status ?? 'Available',
        company: profile?.company ?? 'Piche Communications',
        department:
          profile?.department === undefined
            ? { name: 'Customer Success' }
            : profile.department
            ? { name: profile.department }
            : null,
        position:
          profile?.position === undefined
            ? { jobTitle: 'Account Executive' }
            : profile.position
            ? { jobTitle: profile.position }
            : null,
        additionalEmails,
        phoneNumbers,
        address: profile?.address ?? {
          country: 'Latvia',
          street: 'Brīvības iela 123',
          postalCode: 'LV-1010',
          city: 'Riga',
        },
        socialLinks: profile?.socialLinks?.length
          ? profile.socialLinks
          : [
              {
                id: 'linkedin',
                label: 'LinkedIn',
                url: 'https://www.linkedin.com',
              },
              {
                id: 'instagram',
                label: 'Instagram',
                url: 'https://www.instagram.com',
              },
            ],
        coverImageUrl:
          profile?.coverImageUrl ??
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&auto=format&fit=crop',
      };
    },
    [user.displayName, user.email, user.photoURL, user.uid]
  );

  useEffect(() => {
    setIsProfileLoading(true);

    const unsubscribe = subscribeToUserProfile(user.uid, (nextProfile) => {
      setProfileContact(buildProfileContact(nextProfile));
      setIsProfileLoading(false);
    });

    return unsubscribe;
  }, [user.uid, buildProfileContact]);

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
      <AppDock
        user={user}
        activeApp={activeApp}
        onSelectApp={(appId) => {
          if (appId === 'chat') {
            setActiveApp('chat');
          }
        }}
        onOpenProfile={() => setActiveApp('profile')}
      />

      {activeApp === 'profile' ? (
        <MuiThemeProvider theme={profileTheme}>
          <div className="profile-view">
            <MainPanelWrapper onSignOut={onSignOut}>
              <PersonalInfo
                profileContact={profileContact}
                isLoading={isProfileLoading}
              />
            </MainPanelWrapper>
          </div>
        </MuiThemeProvider>
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
          />

          <ChatView
            user={user}
            conversation={activeConversationState.conversation}
            messages={activeConversationState.messages}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />

          <AiPanel />
        </>
      )}
    </div>
  );
}
