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
      sx={{
        height: '100%',
        padding: '48px 40px',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #f7f9ff 0%, #f5f7fb 100%)',
      }}
      className="personal-info"
    >
      <PuiTypography
        variant="body-lg-medium"
        sx={{
          marginBottom: '36px !important',
          marginLeft: '24px',
          fontWeight: 500,
          fontSize: '20px',
          letterSpacing: '-0.01em',
        }}
      >
        Personal Information
      </PuiTypography>
      <PuiBox sx={{ maxWidth: '747px' }}>
        <PuiBox
          sx={{
            background: 'linear-gradient(180deg, #f7f9ff 0%, #f5f7fb 100%)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            '& > *': {
              marginBottom: '0 !important',
            },
          }}
        >
          <PersonalData profileContact={profileContact} isLoading={isLoading} />
          <Address address={profileContact?.address ?? null} />
          <SocialMedia links={profileContact?.socialLinks ?? []} />
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};
