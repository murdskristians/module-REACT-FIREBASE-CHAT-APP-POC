import { PuiBox, PuiTypography } from 'piche.ui';

interface PersonalDataItemProps {
  title: string;
  value?: string;
}

export const PersonalDataItem = ({ title, value }: PersonalDataItemProps) => {
  const displayValue = value?.trim() ? value.trim() : 'No information';

  return (
    <PuiBox sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <PuiTypography
        variant='body-xxs-medium'
        sx={{
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#9CA3BA',
          fontSize: '11px',
        }}
      >
        {title}
      </PuiTypography>
      <PuiTypography variant='body-sm-medium' sx={{ color: '#20243B', fontSize: '14px' }}>
        {displayValue}
      </PuiTypography>
    </PuiBox>
  );
};
