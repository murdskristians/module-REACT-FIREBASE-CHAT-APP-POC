import { PuiIcon, PuiSvgIcon } from 'piche.ui';

import { ProfileAddressDetails } from '../../types/profile';

import { NoContent } from './NoContent';
import { IconSize } from '../../config';

import { PersonalDataItem } from './PersonalDataItem';

import {
  AddressWrapper,
  ContactInformationTitle,
  SectionContainer,
  SectionTitle,
} from './StyledComponents';

interface AddressProps {
  address?: ProfileAddressDetails | null;
}

export const Address = ({ address }: AddressProps) => {
  const hasAddress = Boolean(
    address?.country || address?.street || address?.postalCode || address?.city
  );

  return (
    <SectionContainer sx={{ padding: '24px', marginBottom: '16px' }}>
      <ContactInformationTitle>
        <SectionTitle variant="body-m-medium">
          <PuiSvgIcon
            icon={PuiIcon.MarkerPin}
            width={IconSize.Medium}
            height={IconSize.Medium}
          />
          Address
        </SectionTitle>
      </ContactInformationTitle>
      {hasAddress ? (
        <AddressWrapper>
          <PersonalDataItem title="Country" value={address?.country ?? ''} />
          <PersonalDataItem title="Street" value={address?.street ?? ''} />
          <PersonalDataItem
            title="Postal code"
            value={address?.postalCode ?? ''}
          />
          <PersonalDataItem title="City" value={address?.city ?? ''} />
        </AddressWrapper>
      ) : (
        <NoContent
          title="No address added"
          text="Add your address to complete your profile and help others reach you when needed."
          align="center"
        />
      )}
    </SectionContainer>
  );
};
