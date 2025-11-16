import { PuiBox, PuiIcon, PuiSvgIcon, PuiTypography, useTheme } from 'piche.ui';
import { FC } from 'react';
import { Avatar } from '../../shared/Avatar';
import type { CallState } from '../../../../types/call';

interface IncomingCallPopupProps {
  callState: CallState;
  onAccept: () => void;
  onDecline: () => void;
  callerName?: string;
  callerAvatarUrl?: string;
}

export const IncomingCallPopup: FC<IncomingCallPopupProps> = ({
  callState,
  onAccept,
  onDecline,
  callerName = 'Unknown',
  callerAvatarUrl,
}) => {
  const theme = useTheme();

  if (!callState.isCalling || !callState.callingMessage) {
    return null;
  }

  return (
    <PuiBox
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: theme.palette.grey[600],
        borderRadius: '16px',
        padding: '32px 24px',
        width: '302px',
        boxShadow: '0px -4px 12px 0px rgba(0, 0, 0, 0.05), -4px 8px 16px -2px rgba(27, 33, 44, 0.12)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '32px',
      }}
    >
      <PuiBox
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulse circles */}
        <PuiBox
          sx={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            opacity: 0.3,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 0.3,
              },
              '50%': {
                transform: 'scale(1.2)',
                opacity: 0.1,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 0.3,
              },
            },
          }}
        />
        <PuiBox
          sx={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            opacity: 0.2,
            animation: 'pulse 2s infinite 0.3s',
          }}
        />
        <PuiBox
          sx={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: theme.palette.grey[500],
            zIndex: 1,
          }}
        />
        <PuiBox sx={{ position: 'relative', zIndex: 2 }}>
          <Avatar
            name={callerName}
            avatarUrl={callerAvatarUrl}
            size={80}
          />
        </PuiBox>
      </PuiBox>

      <PuiBox>
        <PuiTypography variant="h5" sx={{ color: 'white', marginBottom: '8px' }}>
          {callerName}
        </PuiTypography>
        <PuiTypography variant="body-sm-regular" sx={{ color: theme.palette.grey[300] }}>
          is calling you
        </PuiTypography>
      </PuiBox>

      <PuiBox
        sx={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <PuiBox
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PuiBox
            onClick={onDecline}
            sx={{
              padding: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#DD2D2D',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: '#EB4F4F',
              },
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.Phone2Call}
              width={24}
              height={24}
              stroke="white"
            />
          </PuiBox>
          <PuiTypography variant="body-sm-regular" sx={{ color: 'white' }}>
            Decline
          </PuiTypography>
        </PuiBox>

        <PuiBox
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PuiBox
            onClick={onAccept}
            sx={{
              padding: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#34B65A',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: '#5BC67A',
              },
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.Phone}
              width={24}
              height={24}
              stroke="white"
            />
          </PuiBox>
          <PuiTypography variant="body-sm-regular" sx={{ color: 'white' }}>
            Accept
          </PuiTypography>
        </PuiBox>
      </PuiBox>
    </PuiBox>
  );
};

