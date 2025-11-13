import { PuiIcon, PuiSvgIcon } from 'piche.ui';

import { ProfileAddressDetails } from '@/types/profile';

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
  const details = address ?? {
    country: 'Latvia',
    street: 'Brīvības iela 123',
    postalCode: 'LV-1010',
    city: 'Riga',
  };

  const hasAddress = Boolean(
    details?.country || details?.street || details?.postalCode || details?.city
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
          <PersonalDataItem title="Country" value={details?.country ?? ''} />
          <PersonalDataItem title="Street" value={details?.street ?? ''} />
          <PersonalDataItem
            title="Postal code"
            value={details?.postalCode ?? ''}
          />
          <PersonalDataItem title="City" value={details?.city ?? ''} />
        </AddressWrapper>
      ) : (
        <NoContent
          title="No address added"
          text="Add your address to complete your profile and help others reach you when needed."
        />
      )}
    </SectionContainer>
  );
};
