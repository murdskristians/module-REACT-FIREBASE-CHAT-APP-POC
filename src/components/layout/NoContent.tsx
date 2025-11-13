import { PuiTypography, useTheme } from 'piche.ui';

interface NoContentProps {
  title: string;
  text: string;
}

export const NoContent = ({ title, text }: NoContentProps) => {
  const theme = useTheme();

  return (
    <>
      <PuiTypography
        variant='body-m-medium'
        sx={{ textAlign: 'center', marginBottom: '8px' }}
      >
        {title}
      </PuiTypography>
      <PuiTypography
        variant='body-m-medium'
        sx={{ textAlign: 'center', color: theme.palette.grey[300] }}
      >
        {text}
      </PuiTypography>
    </>
  );
};
