import { PuiButton, PuiIcon, PuiStack, PuiSvgIcon, PuiTypography } from 'piche.ui';
import type { FC } from 'react';

import type { CallSession } from '../../../firebase/calls';
import { Avatar } from '../shared/Avatar';

interface IncomingCallModalProps {
  call: CallSession;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: FC<IncomingCallModalProps> = ({
  call,
  onAccept,
  onDecline,
}) => {
  const isVideoCall = call.type === 'video';

  return (
    <PuiStack
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PuiStack
        sx={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px 32px',
          maxWidth: '400px',
          width: '90%',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Caller Avatar */}
        <Avatar
          avatarUrl={call.callerAvatar}
          name={call.callerName}
          avatarColor={call.callerAvatar ? undefined : '#6366f1'}
          size={80}
        />

        {/* Call Info */}
        <PuiStack sx={{ alignItems: 'center', gap: '8px' }}>
          <PuiTypography
            variant="body-lg-semibold"
            sx={{ fontSize: '20px', color: '#1f2937' }}
          >
            {call.callerName}
          </PuiTypography>
          <PuiStack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PuiSvgIcon
              icon={isVideoCall ? PuiIcon.Video : PuiIcon.Phone}
              width={16}
              height={16}
              sx={{ color: '#6b7280' }}
            />
            <PuiTypography
              variant="body-sm-regular"
              sx={{ fontSize: '14px', color: '#6b7280' }}
            >
              Incoming {isVideoCall ? 'video' : 'voice'} call...
            </PuiTypography>
          </PuiStack>
        </PuiStack>

        {/* Action Buttons */}
        <PuiStack
          sx={{
            flexDirection: 'row',
            gap: '16px',
            width: '100%',
            marginTop: '8px',
          }}
        >
          {/* Decline Button */}
          <PuiButton
            onClick={onDecline}
            sx={{
              flex: 1,
              padding: '14px 24px',
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background 0.2s',
              '&:hover': {
                background: '#dc2626',
              },
            }}
          >
            <PuiSvgIcon
              icon={PuiIcon.PhoneOff}
              width={24}
              height={24}
            />
            Decline
          </PuiButton>

          {/* Accept Button */}
          <PuiButton
            onClick={onAccept}
            sx={{
              flex: 1,
              padding: '14px 24px',
              background: '#22c55e',
              color: '#ffffff',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background 0.2s',
              '&:hover': {
                background: '#16a34a',
              },
            }}
          >
            <PuiSvgIcon
              icon={isVideoCall ? PuiIcon.Video : PuiIcon.Phone}
              width={24}
              height={24}
            />
            Accept
          </PuiButton>
        </PuiStack>
      </PuiStack>
    </PuiStack>
  );
};
