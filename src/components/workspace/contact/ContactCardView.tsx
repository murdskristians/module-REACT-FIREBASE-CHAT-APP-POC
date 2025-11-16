import {
  PuiBox,
  PuiContactCard,
  type PuiContact,
  StatusOptions,
} from 'piche.ui';
import { FC } from 'react';

import type { Contact } from '../../../firebase/users';

interface ContactCardViewProps {
  contact: Contact;
  onBack: () => void;
  onClose: () => void;
}

const mapContactToPuiContact = (contact: Contact): PuiContact => {
  return {
    id: contact.id,
    name: contact.displayName ?? contact.email ?? 'Unknown',
    email: (' ' + contact.email) as string,
    avatarUrl: contact.avatarUrl ?? undefined,
    company: 'Piche Communications',
    position: {
      id: 'pos-1',
      jobTitle: ' Senior Software Engineer',
    },
    address: {
      details: {
        city: 'Riga',
        country: 'Latvia',
        postalCode: 'LV-1010',
        route: ' Brīvības iela 123',
      },
    },
    phones: [
      { id: 'phone-1', label: 'Mobile', phone: '+371 2000 0000' },
      { id: 'phone-2', label: 'Work', phone: '+371 2000 0001' },
    ],
    birthday: '1992-03-12T00:00:00Z',
    socialMedia: [
      'https://linkedin.com/in/contact',
      'https://twitter.com/contact',
    ],
    nameDay: '2024-01-07T00:00:00Z',
    additionalEmails: [
      { id: 'email-1', label: 'Personal', email: 'personal@example.com' },
      { id: 'email-2', label: 'Work', email: 'work@example.com' },
    ],
  } as PuiContact;
};

export const ContactCardView: FC<ContactCardViewProps> = ({
  contact,
  onBack,
  onClose,
}) => {
  const puiContact = mapContactToPuiContact(contact);

  return (
    <PuiBox
      sx={{
        height: '100%',
        overflowY: 'auto',
        padding: 0,
        backgroundColor: 'var(--bg-primary, #f5f7fb)',
        fontSize: '12px',
        '& *': {
          fontSize: 'inherit',
          color: 'var(--text-primary, #272727)',
        },
        // Ensure contact info container displays items in column
        '& > div > div:last-child': {
          display: 'flex !important',
          flexDirection: 'column !important',
          gap: '12px !important',
          '& > *': {
            width: '100% !important',
            display: 'block !important',
          },
        },
        // Ensure each contact info item takes full width and displays vertically
        '& [class*="ListItem"], & [class*="ListItemLink"]': {
          width: '100% !important',
          display: 'flex !important',
          flexDirection: 'row !important',
          alignItems: 'flex-start !important',
          gap: '16px !important',
          '& > div': {
            display: 'flex !important',
            flexDirection: 'column !important',
            gap: '4px !important',
          },
        },
        // Dark mode support for contact card elements
        '& [class*="MuiPaper"]': {
          backgroundColor: 'var(--bg-primary, #ffffff) !important',
        },
        '& [class*="MuiTypography"]': {
          color: 'var(--text-primary, #272727) !important',
        },
        '& [class*="MuiIconButton"]': {
          color: 'var(--text-primary, #272727) !important',
          backgroundColor: 'var(--bg-primary, #ffffff) !important',
          '& svg': {
            color: 'var(--text-primary, #272727) !important',
          },
          '&:hover': {
            backgroundColor: 'var(--bg-tertiary, #f6f8ff) !important',
          },
        },
        '& button': {
          backgroundColor: 'var(--bg-primary, #ffffff) !important',
          color: 'var(--text-primary, #272727) !important',
          '& svg': {
            color: 'var(--text-primary, #272727) !important',
          },
          '&:hover': {
            backgroundColor: 'var(--bg-tertiary, #f6f8ff) !important',
          },
        },
        '& a': {
          color: 'var(--palette-primary, #3398DB) !important',
        },
        // Fix icon backgrounds in dark mode - icons have white content so need colored backgrounds
        '& [class*="ContactCard"] [class*="Icon"]': {
          backgroundColor: 'var(--palette-primary, #3398DB) !important',
          '& *': {
            color: '#ffffff !important',
          },
        },
        '& [class*="ListItemIcon"]': {
          '& > div': {
            backgroundColor: 'var(--palette-primary, #3398DB) !important',
            '& *': {
              color: '#ffffff !important',
            },
          },
        },
      }}
    >
      <PuiContactCard
        contact={puiContact}
        coverImage={{
          position: { y: 0 },
          url: 'https://ui.piche.it/assets/contact-default-cover-d25a96ce.png',
        }}
        actions={{
          onBack,
          onClose,
        }}
        contactStatus={{
          text: contact.status ?? 'Offline',
          status:
            contact.status === 'Online'
              ? StatusOptions.Online
              : StatusOptions.Offline,
        }}
        showCoverButton={false}
      />
    </PuiBox>
  );
};
