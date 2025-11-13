import { PuiBox, PuiTypography } from 'piche.ui';

interface PersonalDataItemProps {
  title: string;
  value?: string;
}

export const PersonalDataItem = ({ title, value }: PersonalDataItemProps) => {
  const displayValue = value?.trim() ? value.trim() : 'No information';

  return (
    <PuiBox>
      <PuiTypography variant='body-sm-regular'>{title}</PuiTypography>
      <PuiTypography variant='body-m-regular'>{displayValue}</PuiTypography>
    </PuiBox>
  );
};
