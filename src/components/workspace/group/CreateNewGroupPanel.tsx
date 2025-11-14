import {
  PuiBox,
  PuiIcon,
  PuiIconButton,
  PuiLoadingButton,
  PuiSvgIcon,
  PuiSwitch,
  PuiTypography,
  PuiStyled,
} from 'piche.ui';
import { ChangeEvent, useMemo, useState } from 'react';

import { Avatar } from '../shared/Avatar';
import type { Contact } from '../../../firebase/users';
import '../Workspace.css';

const StyledGroupCreationWrapper = PuiStyled(PuiBox)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  background: '#ffffff',
  borderLeft: '1px solid #f0f0f0',
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
  backgroundColor: '#f0f0f0',
  margin: '0 32px',
}));

const StyledGroupCreationBtnWrapper = PuiStyled(PuiBox)(() => ({
  padding: '20px 32px',
  borderTop: '1px solid #f0f0f0',
  marginTop: 'auto',
}));

type CreateNewGroupPanelProps = {
  currentUserId: string;
  contacts: Contact[];
  onCreateGroup: (title: string, selectedContactIds: string[]) => Promise<void>;
  onClose: () => void;
};

export function CreateNewGroupPanel({
  currentUserId,
  contacts,
  onCreateGroup,
  onClose,
}: CreateNewGroupPanelProps) {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(
    new Set()
  );
  const [isCreating, setIsCreating] = useState(false);

  const availableContacts = useMemo(() => {
    return contacts.filter((contact) => contact.id !== currentUserId);
  }, [contacts, currentUserId]);

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return availableContacts;
    }

    return availableContacts.filter((contact) => {
      const displayName = (contact.displayName || '').toLowerCase();
      const email = (contact.email || '').toLowerCase();
      return displayName.includes(term) || email.includes(term);
    });
  }, [availableContacts, searchTerm]);

  const handleToggleContact = (contactId: string) => {
    setSelectedContactIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const handleCreateGroup = async () => {
    if (isCreating || selectedContactIds.size === 0) {
      return;
    }

    setIsCreating(true);
    try {
      const finalGroupName =
        groupName.trim().length > 0 ? groupName.trim() : 'Group Name';
      await onCreateGroup(finalGroupName, Array.from(selectedContactIds));
      setGroupName('');
      setSearchTerm('');
      setSelectedContactIds(new Set());
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <StyledGroupCreationWrapper
      aria-label="Create new group panel"
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
            color: '#272727',
            fontFamily: "'Poppins', 'Inter', sans-serif",
          }}
        >
          Create new group
        </PuiTypography>
        <PuiIconButton onClick={onClose} aria-label="Close" size="small">
          <PuiSvgIcon width={20} height={20} icon={PuiIcon.XClose} />
        </PuiIconButton>
      </PuiBox>

      <StyledHeaderDivider />

      <PuiBox
        sx={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <PuiBox
          sx={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#A8D0FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '32px',
            fontWeight: 600,
            color: '#1f2131',
            fontFamily: "'Poppins', 'Inter', sans-serif",
          }}
        >
          {groupName.trim() ? groupName.trim().charAt(0).toUpperCase() : 'G'}
        </PuiBox>

        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setGroupName(e.target.value)
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
          autoFocus={false}
          style={{
            flex: 1,
            minWidth: 0,
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            color: '#272727',
            outline: 'none',
            background: '#ffffff',
            cursor: 'text',
            pointerEvents: 'auto',
            zIndex: 1000,
            position: 'relative',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3398DB';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#f0f0f0';
          }}
        />
      </PuiBox>

      <PuiBox
        sx={{ padding: '0 32px 16px 32px', position: 'relative', zIndex: 1000 }}
      >
        <input
          type="search"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
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
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: "'Poppins', 'Inter', sans-serif",
            color: '#272727',
            outline: 'none',
            background: '#ffffff',
            boxSizing: 'border-box',
            cursor: 'text',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1000,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3398DB';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#f0f0f0';
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
        {filteredContacts.length > 0 ? (
          <PuiBox sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredContacts.map((contact) => {
              const isSelected = selectedContactIds.has(contact.id);
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
                      backgroundColor: '#f6f8ff',
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
                        color: '#272727',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayName}
                    </PuiTypography>
                  </PuiBox>
                  <PuiSwitch
                    checked={isSelected}
                    sx={{
                      '&.MuiSwitch-root': {
                        width: '40px',
                        height: '24px',
                        padding: 0,
                      },
                      '& .MuiSwitch-switchBase': {
                        padding: '2px',
                        top: '50%',
                        transform: 'translateX(4px) translateY(-50%)',
                        '&.Mui-checked': {
                          transform: 'translateX(19px) translateY(-50%)',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#67D286',
                            opacity: 1,
                            width: '40px',
                            height: '24px',
                          },
                        },
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: '#DBDBDB',
                        opacity: 1,
                        borderRadius: '12px',
                        width: '40px !important',
                        height: '24px !important',
                      },
                      '& .MuiSwitch-thumb': {
                        width: '20px',
                        height: '20px',
                        boxShadow: 'none',
                      },
                    }}
                  />
                </PuiBox>
              );
            })}
          </PuiBox>
        ) : (
          <PuiTypography
            variant="body-sm-medium"
            sx={{
              textAlign: 'center',
              color: '#939393',
              padding: '24px',
              fontSize: '13px',
              fontFamily: "'Poppins', 'Inter', sans-serif",
            }}
          >
            {searchTerm.trim() ? 'No contacts found' : 'No contacts available'}
          </PuiTypography>
        )}
      </PuiBox>

      <StyledGroupCreationBtnWrapper>
        <PuiLoadingButton
          variant="contained"
          size="medium"
          loading={isCreating}
          disabled={selectedContactIds.size === 0}
          fullWidth
          onClick={handleCreateGroup}
          sx={{
            backgroundColor:
              selectedContactIds.size === 0 ? '#d0d0d0' : '#3398DB',
            color: '#ffffff',
            '&:hover:not(.Mui-disabled)': {
              backgroundColor: '#2980b9',
            },
            '&.Mui-disabled': {
              backgroundColor: '#d0d0d0 !important',
              color: '#ffffff',
            },
          }}
        >
          Create new group
        </PuiLoadingButton>
      </StyledGroupCreationBtnWrapper>
    </StyledGroupCreationWrapper>
  );
}
