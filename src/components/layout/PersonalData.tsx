import {
  PuiBox,
  PuiDivider,
  PuiIcon,
  PuiStack,
  PuiSvgIcon,
  PuiTypography,
} from 'piche.ui';

import { IconSize } from '../../config';
import { ProfileContact } from '@/types/profile';

import { PersonalDataHeader } from './PersonalDataHeader';
import { PersonalDataItem } from './PersonalDataItem';

import {
  ContactInformationTitle,
  NameWrapper,
  SectionContainer,
  SectionTitle,
} from './StyledComponents';

interface PersonalDataProps {
  profileContact: ProfileContact | null;
  isLoading: boolean;
}

export const PersonalData = ({
  profileContact,
  isLoading,
}: PersonalDataProps) => {
  if (isLoading) {
    return (
      <SectionContainer sx={{ marginBottom: '16px', padding: '24px' }}>
        <PuiTypography variant="body-m-medium">Loading profile…</PuiTypography>
      </SectionContainer>
    );
  }

  if (!profileContact) {
    return (
      <SectionContainer sx={{ marginBottom: '16px', padding: '24px' }}>
        <PuiTypography variant="body-m-medium">
          Oops, something went wrong.
        </PuiTypography>
      </SectionContainer>
    );
  }

  const additionalEmails =
    profileContact.additionalEmails.length > 0
      ? profileContact.additionalEmails
      : [
          {
            id: 'primary-email',
            label: 'Primary',
            email: profileContact.email ?? 'No email provided',
          },
        ];

  const phoneNumbers =
    profileContact.phoneNumbers.length > 0
      ? profileContact.phoneNumbers
      : [
          {
            id: 'mobile-phone',
            label: 'Mobile',
            phone: '+371 2000 0000',
          },
        ];

  return (
    <SectionContainer sx={{ marginBottom: '16px' }}>
      <PersonalDataHeader profileContact={profileContact} />
      <NameWrapper>
        <PuiTypography variant="h5" sx={{ marginBottom: '8px' }}>
          {profileContact.name}
        </PuiTypography>
        {profileContact.statusMessage && (
          <PuiStack
            sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}
          >
            <PuiTypography variant="body-sm-medium" color="grey.400">
              {profileContact.statusMessage}
            </PuiTypography>
          </PuiStack>
        )}
      </NameWrapper>
      <PuiBox sx={{ padding: '24px' }}>
        <PuiDivider orientation="horizontal" sx={{ marginBottom: '24px' }} />
        <ContactInformationTitle>
          <SectionTitle variant="body-m-medium">
            <PuiSvgIcon
              icon={PuiIcon.File2}
              width={IconSize.Small}
              height={IconSize.Small}
            />
            Contact information
          </SectionTitle>
        </ContactInformationTitle>
        <PuiBox
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            rowGap: '24px',
          }}
        >
          <PersonalDataItem title="Full name" value={profileContact.name} />
          <PersonalDataItem
            title="Date of birth"
            value={
              profileContact?.statusMessage
                ? 'March 12, 1992'
                : 'March 12, 1992'
            }
          />
          <PersonalDataItem title="Name day" value="January 7" />
          <PersonalDataItem
            title="Company"
            value={profileContact.company ?? 'Piche Communications'}
          />
          <PersonalDataItem
            title="Department"
            value={profileContact.department?.name ?? 'Customer Success'}
          />
          <PersonalDataItem
            title="Position"
            value={profileContact.position?.jobTitle ?? 'Account Executive'}
          />
          {additionalEmails.map((item) => (
            <PersonalDataItem
              key={item.id}
              title={`${item.label} email`}
              value={item.email}
            />
          ))}
          {phoneNumbers.map((item) => (
            <PersonalDataItem
              key={item.id}
              title={`${item.label} phone`}
              value={item.phone}
            />
          ))}
        </PuiBox>
      </PuiBox>
    </SectionContainer>
  );
};
