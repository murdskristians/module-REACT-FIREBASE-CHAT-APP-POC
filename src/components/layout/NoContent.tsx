import { PuiBox, PuiTypography, useTheme } from 'piche.ui';

interface NoContentProps {
  title: string;
  text: string;
  align?: 'left' | 'center';
}

export const NoContent = ({
  title,
  text,
  align = 'center',
}: NoContentProps) => {
  const theme = useTheme();
  const alignItems = align === 'center' ? 'center' : 'flex-start';

  return (
    <PuiBox
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems,
        gap: '6px',
        textAlign: align,
      }}
    >
      <PuiTypography variant="body-m-medium" sx={{ textAlign: align }}>
        {title}
      </PuiTypography>
      <PuiTypography
        variant="body-m-medium"
        sx={{
          textAlign: align,
          color: theme.palette.grey[300],
          maxWidth: '420px',
        }}
      >
        {text}
      </PuiTypography>
    </PuiBox>
  );
};
