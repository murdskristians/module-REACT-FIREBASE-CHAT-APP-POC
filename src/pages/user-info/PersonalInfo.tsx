import { PuiBox, PuiTypography } from 'piche.ui';

import { SocialMedia } from '../../components/layout/SocialMedia';
import { Address } from '../../components/layout/Address';
import { PersonalData } from '../../components/layout/PersonalData';
import { ProfileContact } from '../../types/profile';

interface PersonalInfoProps {
  profileContact: ProfileContact | null;
  isLoading: boolean;
}

export const PersonalInfo = ({
  profileContact,
  isLoading,
}: PersonalInfoProps) => {
  return (
    <PuiBox
      sx={{ height: '100%', padding: '40px', overflowY: 'auto' }}
      className="personal-info"
    >
      <PuiTypography variant="body-xl-medium" sx={{ marginBottom: '24px' }}>
        Personal Information
      </PuiTypography>
      <PuiBox sx={{ maxWidth: '747px' }}>
        <PersonalData profileContact={profileContact} isLoading={isLoading} />
        <Address address={profileContact?.address ?? null} />
        <SocialMedia links={profileContact?.socialLinks ?? []} />
      </PuiBox>
    </PuiBox>
  );
};
