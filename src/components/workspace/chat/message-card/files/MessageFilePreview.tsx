import { PuiBox, PuiIcon, PuiSvgIcon, PuiStack, PuiTypography, useTheme } from 'piche.ui';
import { FC } from 'react';

interface MessageFilePreviewProps {
  fileUrl: string;
  fileName: string;
  onClick?: () => void;
}

export const MessageFilePreview: FC<MessageFilePreviewProps> = ({ fileUrl, fileName, onClick }) => {
  const theme = useTheme();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <PuiBox
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        background: theme.palette.grey[50],
        width: '219px',
        marginBottom: '8px',
        '&:hover': {
          background: theme.palette.grey[100],
        },
      }}
    >
      <PuiBox
        sx={{
          width: '46px',
          height: '46px',
          minWidth: '46px',
          minHeight: '46px',
          borderRadius: '4px',
          background: theme.palette.grey[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <PuiSvgIcon
          icon={PuiIcon.Attachment}
          width={24}
          height={24}
          stroke={theme.palette.grey[400]}
        />
      </PuiBox>
      <PuiStack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
        <PuiTypography
          variant="body-m-medium"
          sx={{
            fontSize: '13px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '165px',
          }}
        >
          {fileName}
        </PuiTypography>
        <PuiTypography variant="body-sm-regular" sx={{ fontSize: '12px', color: theme.palette.grey[600] }}>
          File
        </PuiTypography>
      </PuiStack>
    </PuiBox>
  );
};

