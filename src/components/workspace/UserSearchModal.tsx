import {
  PuiAvatar,
  PuiBox,
  PuiCircularProgress,
  PuiIcon,
  PuiStack,
  PuiSvgIcon,
  PuiTextInput,
  PuiTypography,
} from 'piche.ui';
import { useState, type FC } from 'react';
import { styled } from '@mui/material/styles';

import { StyledModal } from '../layout/StyledComponents';
import type { Contact } from '../../firebase/users';
import type { Conversation } from '../../firebase/conversations';

const SearchInputWrapper = styled(PuiBox)(({ theme }) => ({
  padding: '16px 24px 8px 24px',
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

const UserListContainer = styled(PuiBox)(({ theme }) => ({
  maxHeight: '400px',
  minHeight: '200px',
  overflowY: 'auto',
  padding: '8px 0',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.grey[500],
    },
  },
}));

const UserListItem = styled(PuiBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 24px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

const ConversationBadge = styled(PuiBox)(({ theme }) => ({
  padding: '2px 8px',
  borderRadius: '12px',
  backgroundColor: theme.palette.primary.main,
  marginLeft: 'auto',
}));

const EmptyState = styled(PuiBox)(({ theme }) => ({
  padding: '32px',
  textAlign: 'center',
  color: theme.palette.grey[600],
}));

interface UserSearchModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  contacts: Contact[];
  conversations: Conversation[];
  currentUserId: string;
  onUserSelect: (user: Contact) => void;
  isLoading?: boolean;
}

export const UserSearchModal: FC<UserSearchModalProps> = ({
  showModal,
  setShowModal,
  contacts,
  conversations,
  currentUserId,
  onUserSelect,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Simple filter function
  const getFilteredContacts = () => {
    if (!contacts || !Array.isArray(contacts)) {
      return [];
    }

    if (!searchQuery.trim()) {
      return contacts;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = contacts.filter((contact) => {
      const displayName = (contact.displayName || '').toLowerCase();
      const email = (contact.email || '').toLowerCase();
      return displayName.includes(query) || email.includes(query);
    });

    return filtered;
  };

  // Check if a conversation exists with a specific user
  const hasConversation = (userId: string): boolean => {
    return conversations.some(
      (conv) =>
        conv.participants.includes(userId) &&
        conv.participants.includes(currentUserId)
    );
  };

  const handleUserClick = (user: Contact) => {
    onUserSelect(user);
    setShowModal(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery(''); // Reset search on close
  };

  const filteredContacts = getFilteredContacts();

  return (
    <StyledModal
      title="Search Users"
      open={showModal}
      onClose={handleClose}
      subtitle={
        <PuiTypography variant="body-m-regular" color="textSecondary">
          Search and select a user to start a conversation
        </PuiTypography>
      }
      titleIcon={
        <PuiBox sx={{ position: 'relative', padding: 0 }}>
          <PuiSvgIcon icon={PuiIcon.Search} />
        </PuiBox>
      }
    >
      <SearchInputWrapper>
        <PuiTextInput
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          startAdornment={
            <PuiSvgIcon
              icon={PuiIcon.Search}
              sx={{ color: 'grey.500', fontSize: '20px' }}
            />
          }
          autoFocus
        />
      </SearchInputWrapper>

      <UserListContainer>
        {isLoading ? (
          <EmptyState>
            <PuiCircularProgress size={32} />
            <PuiTypography variant="body-m-regular" sx={{ mt: 2 }}>
              Loading users...
            </PuiTypography>
          </EmptyState>
        ) : filteredContacts.length === 0 ? (
          <EmptyState>
            <PuiTypography variant="body-m-regular">
              {searchQuery
                ? 'No users found matching your search'
                : 'No users available'}
            </PuiTypography>
          </EmptyState>
        ) : (
          <>
            {filteredContacts
              .filter((contact) => contact != null)
              .map((contact) => (
                <UserListItem
                  key={contact.id}
                  onClick={() => handleUserClick(contact)}
                >
                  <PuiAvatar
                    src={contact?.avatarUrl || undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: contact?.avatarColor || '#A8D0FF',
                      marginRight: '12px',
                    }}
                  >
                    {!contact?.avatarUrl &&
                      contact?.displayName?.[0]?.toUpperCase()}
                  </PuiAvatar>

                  <PuiStack spacing="2px">
                    <PuiTypography variant="body-m-semibold">
                      {contact.displayName || 'Unknown User'}
                    </PuiTypography>
                    <PuiTypography
                      variant="body-s-regular"
                      color="textSecondary"
                    >
                      {contact.email}
                    </PuiTypography>
                  </PuiStack>

                  {hasConversation(contact.id) && (
                    <ConversationBadge>
                      <PuiTypography
                        variant="body-xs-semibold"
                        sx={{ color: 'white' }}
                      >
                        Existing Chat
                      </PuiTypography>
                    </ConversationBadge>
                  )}
                </UserListItem>
              ))}
          </>
        )}
      </UserListContainer>
    </StyledModal>
  );
};
