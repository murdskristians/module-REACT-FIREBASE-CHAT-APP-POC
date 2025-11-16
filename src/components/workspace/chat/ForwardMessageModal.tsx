import {
  PuiBox,
  PuiIcon,
  PuiIconButton,
  PuiLoadingButton,
  PuiSvgIcon,
  PuiTypography,
  PuiStyled,
} from 'piche.ui';
import { ChangeEvent, useState, type FC, useMemo } from 'react';

import { Avatar } from '../shared/Avatar';
import type { Contact } from '../../../firebase/users';
import type { Conversation, ConversationMessage } from '../../../firebase/conversations';
import { Reply } from './message-card/reply/Reply';
import type { MessageReply } from '../../../firebase/conversations';
import '../Workspace.css';

const StyledForwardPanelWrapper = PuiStyled(PuiBox)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  background: 'var(--bg-primary, #ffffff)',
  borderLeft: '1px solid var(--border-color, #f0f0f0)',
  position: 'relative',
  pointerEvents: 'auto',
  zIndex: 1001,
  '& *': {
    pointerEvents: 'auto',
  },
  '& input': {
    pointerEvents: 'auto !important',
  },
}));

const StyledHeaderDivider = PuiStyled(PuiBox)(() => ({
  height: '1px',
  backgroundColor: 'var(--border-color, #f0f0f0)',
  margin: '0 32px',
}));

const StyledButtonWrapper = PuiStyled(PuiBox)(() => ({
  padding: '20px 32px',
  borderTop: '1px solid var(--border-color, #f0f0f0)',
  marginTop: 'auto',
}));

const StyledToggle = PuiStyled(PuiBox)<{ checked: boolean }>(({ checked }) => ({
  width: '40px',
  height: '24px',
  borderRadius: '12px',
  backgroundColor: checked ? '#67D286' : '#DBDBDB',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  flexShrink: 0,
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    top: '2px',
    left: checked ? '18px' : '2px',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  },
}));


interface ForwardMessageModalProps {
  open: boolean;
  onClose: () => void;
  message: ConversationMessage;
  conversations: Conversation[];
  contacts: Contact[];
  currentUserId: string;
  onForward: (targetConversationIds: string[], forwardText?: string) => Promise<void>;
  isLoading?: boolean;
}

export const ForwardMessageModal: FC<ForwardMessageModalProps> = ({
  open,
  onClose,
  message,
  conversations,
  contacts,
  currentUserId,
  onForward,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [forwardText, setForwardText] = useState('');

  // Get all available contacts (excluding current user)
  const availableContacts = useMemo(() => {
    return contacts.filter((contact) => contact.id !== currentUserId);
  }, [contacts, currentUserId]);

  // Map conversations to contacts for selection
  // For direct conversations, use the other participant
  // For group conversations, we'll need to handle them differently
  const contactsFromConversations = useMemo(() => {
    const contactMap = new Map<string, Contact>();
    
    // Add all contacts
    availableContacts.forEach((contact) => {
      contactMap.set(contact.id, contact);
    });

    // Add contacts from direct conversations
    conversations.forEach((conv) => {
      if (conv.type === 'direct') {
        const otherParticipantId = conv.participants.find((id) => id !== currentUserId);
        if (otherParticipantId) {
          const contact = contacts.find((c) => c.id === otherParticipantId);
          if (contact && !contactMap.has(contact.id)) {
            contactMap.set(contact.id, contact);
          }
        }
      }
    });

    return Array.from(contactMap.values());
  }, [conversations, contacts, currentUserId, availableContacts]);

  // Filter contacts from conversations based on search
  const filteredContactsFromConversations = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      return contactsFromConversations;
    }

    return contactsFromConversations.filter((contact) => {
      const displayName = (contact.displayName || '').toLowerCase();
      const email = (contact.email || '').toLowerCase();
      return displayName.includes(term) || email.includes(term);
    });
  }, [contactsFromConversations, searchQuery]);

  const handleToggleContact = (contactId: string) => {
    setSelectedConversationIds((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      }
      return [...prev, contactId];
    });
  };

  const handleForward = async () => {
    if (selectedConversationIds.length === 0) return;
    await onForward(selectedConversationIds, forwardText.trim() || undefined);
    setSelectedConversationIds([]);
    setForwardText('');
    setSearchQuery('');
  };

  const handleClose = () => {
    setSelectedConversationIds([]);
    setForwardText('');
    setSearchQuery('');
    onClose();
  };

  // Create reply data for preview
  const replyData: MessageReply | null = useMemo(() => {
    if (!message) return null;
    return {
      messageId: message.id,
      senderId: message.senderId,
      senderName: message.senderName ?? null,
      text: message.text ?? null,
      imageUrl: message.imageUrl ?? null,
      type: message.type,
      createdAt: message.createdAt ?? null,
    };
  }, [message]);


  // Guard against missing message or closed panel
  if (!message || !open) {
    return null;
  }

  return (
    <StyledForwardPanelWrapper
      aria-label="Forward message panel"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <PuiBox
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '32px 32px 24px 32px',
        }}
      >
        <PuiTypography
          variant="h5"
          sx={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary, #272727)',
            fontFamily: "'Poppins', 'Inter', sans-serif",
          }}
        >
          Forward Message
        </PuiTypography>
        <PuiIconButton
          onClick={handleClose}
          aria-label="Close"
          size="small"
          sx={{
            '& svg': {
              color: 'var(--text-primary, #272727)',
            },
          }}
        >
          <PuiSvgIcon width={20} height={20} icon={PuiIcon.XClose} />
        </PuiIconButton>
      </PuiBox>

      <StyledHeaderDivider />

      <PuiBox
        sx={{
          padding: '0 32px 16px 32px',
          textAlign: 'center',
        }}
      >
        <PuiTypography
          variant="body-m-regular"
          sx={{
            color: 'var(--text-secondary, #939393)',
            fontSize: '13px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            textAlign: 'center',
          }}
        >
          Select conversations or contacts to forward this message
        </PuiTypography>
      </PuiBox>
      <PuiBox
        sx={{ padding: '0 32px 16px 32px', position: 'relative', zIndex: 1000 }}
      >
        <input
          type="search"
          placeholder="Search contacts"
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.focus();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          disabled={false}
          readOnly={false}
          tabIndex={0}
          style={{
            width: '100%',
            border: '1px solid var(--border-color, #f0f0f0)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            color: 'var(--text-primary, #272727)',
            outline: 'none',
            background: 'var(--bg-primary, #ffffff)',
            boxSizing: 'border-box',
            cursor: 'text',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1000,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--palette-primary, #3398DB)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color, #f0f0f0)';
          }}
        />
      </PuiBox>

      <PuiBox
        sx={{
          flexGrow: 1,
          paddingBottom: '8px',
          overflowY: 'auto',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
        className="scrollbar-hover"
      >
        {filteredContactsFromConversations.length > 0 ? (
          <PuiBox sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredContactsFromConversations.map((contact) => {
              const isSelected = selectedConversationIds.includes(contact.id);
              const displayName =
                contact.displayName ?? contact.email ?? 'Unknown User';

              return (
                <PuiBox
                  key={contact.id}
                  onClick={() => handleToggleContact(contact.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    minHeight: '56px',
                    '&:hover': {
                      backgroundColor: 'var(--bg-tertiary, #f6f8ff)',
                    },
                  }}
                >
                  <PuiBox
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Avatar
                      avatarUrl={contact.avatarUrl ?? null}
                      name={displayName}
                      avatarColor={contact.avatarColor ?? '#A8D0FF'}
                      size={40}
                    />
                    <PuiTypography
                      variant="body-m-medium"
                      sx={{
                        fontSize: '14px',
                        fontFamily: "'Poppins', 'Inter', sans-serif",
                        color: 'var(--text-primary, #272727)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayName}
                    </PuiTypography>
                  </PuiBox>
                  <StyledToggle checked={isSelected} />
                </PuiBox>
              );
            })}
          </PuiBox>
        ) : (
          <PuiTypography
            variant="body-sm-medium"
            sx={{
              textAlign: 'center',
              color: 'var(--text-secondary, #939393)',
              padding: '24px',
              fontSize: '13px',
              fontFamily: "'Poppins', 'Inter', sans-serif",
            }}
          >
            {searchQuery.trim() ? 'No contacts found' : 'No contacts available'}
          </PuiTypography>
        )}
      </PuiBox>

      {replyData && (
        <PuiBox
          sx={{
            padding: '4px 32px 4px 32px',
          }}
        >
          <PuiTypography
            variant="body-sm-medium"
            sx={{
              marginBottom: '8px',
              fontSize: '13px',
              fontFamily: "'Poppins', 'Inter', sans-serif",
              color: 'var(--text-primary, #272727)',
            }}
          >
            Message Preview:
          </PuiTypography>
          <PuiBox
            sx={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-tertiary, #f6f8ff)',
              borderRadius: '8px',
            }}
          >
            <Reply replyTo={replyData} />
          </PuiBox>
        </PuiBox>
      )}

      <PuiBox
        sx={{
          padding: '0 32px 16px 32px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <textarea
          placeholder="Add a comment (optional)..."
          value={forwardText}
          onChange={(e) => setForwardText(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.focus();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          disabled={false}
          readOnly={false}
          tabIndex={0}
          style={{
            width: '100%',
            border: '1px solid var(--border-color, #f0f0f0)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            color: 'var(--text-primary, #272727)',
            outline: 'none',
            background: 'var(--bg-primary, #ffffff)',
            boxSizing: 'border-box',
            cursor: 'text',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1000,
            resize: 'vertical',
            minHeight: '60px',
            maxHeight: '120px',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--palette-primary, #3398DB)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color, #f0f0f0)';
          }}
        />
      </PuiBox>

      <StyledButtonWrapper>
        <PuiLoadingButton
          variant="contained"
          size="medium"
          loading={isLoading}
          disabled={selectedConversationIds.length === 0}
          fullWidth
          onClick={handleForward}
          sx={{
            backgroundColor:
              selectedConversationIds.length === 0 ? 'var(--bg-tertiary, #d0d0d0)' : 'var(--palette-primary, #3398DB)',
            color: '#ffffff',
            '&:hover:not(.Mui-disabled)': {
              backgroundColor: 'var(--palette-primary-dark, #2980b9)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'var(--bg-tertiary, #d0d0d0) !important',
              color: '#ffffff',
            },
          }}
        >
          Forward ({selectedConversationIds.length})
        </PuiLoadingButton>
      </StyledButtonWrapper>
    </StyledForwardPanelWrapper>
  );
};

