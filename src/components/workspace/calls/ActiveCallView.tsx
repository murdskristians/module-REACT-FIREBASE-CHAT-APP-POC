import { PuiButton, PuiIcon, PuiStack, PuiSvgIcon, PuiTypography } from 'piche.ui';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { CallSession } from '../../../firebase/calls';
import { Avatar } from '../shared/Avatar';

interface ActiveCallViewProps {
  call: CallSession;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
  onToggleMute: (muted: boolean) => void;
  onToggleVideo: (enabled: boolean) => void;
}

export const ActiveCallView: FC<ActiveCallViewProps> = ({
  call,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(call.type === 'video');
  const [callDuration, setCallDuration] = useState(0);

  const isVideoCall = call.type === 'video';
  const isActive = call.status === 'active';

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call duration timer
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onToggleMute(newMuted);
  };

  const handleToggleVideo = () => {
    const newEnabled = !isVideoEnabled;
    setIsVideoEnabled(newEnabled);
    onToggleVideo(newEnabled);
  };

  return (
    <PuiStack
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#1f2937',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Remote Video/Avatar */}
      <PuiStack
        sx={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {isVideoCall && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <PuiStack sx={{ alignItems: 'center', gap: '16px' }}>
            <Avatar
              avatarUrl={call.callerId === call.callerId ? call.receiverAvatar : call.callerAvatar}
              name={call.callerId === call.callerId ? call.receiverName : call.callerName}
              avatarColor="#6366f1"
              size={120}
            />
            <PuiTypography
              variant="body-lg-semibold"
              sx={{ fontSize: '24px', color: '#ffffff' }}
            >
              {call.callerId === call.callerId ? call.receiverName : call.callerName}
            </PuiTypography>
            <PuiTypography
              variant="body-sm-regular"
              sx={{ fontSize: '14px', color: '#9ca3af' }}
            >
              {isActive ? formatDuration(callDuration) : 'Connecting...'}
            </PuiTypography>
          </PuiStack>
        )}
      </PuiStack>

      {/* Local Video (Picture-in-Picture) */}
      {isVideoCall && localStream && (
        <PuiStack
          sx={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '180px',
            height: '135px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            background: '#000',
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror effect
            }}
          />
        </PuiStack>
      )}

      {/* Call Controls */}
      <PuiStack
        sx={{
          padding: '24px',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Duration */}
        {isActive && (
          <PuiTypography
            variant="body-sm-regular"
            sx={{
              fontSize: '14px',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            {formatDuration(callDuration)}
          </PuiTypography>
        )}

        {/* Control Buttons */}
        <PuiStack
          sx={{
            flexDirection: 'row',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Mute Button */}
          <PuiButton
            onClick={handleToggleMute}
            sx={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              '&:hover': {
                background: isMuted ? '#dc2626' : 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <PuiSvgIcon
              icon={isMuted ? PuiIcon.MicrophoneOff : PuiIcon.Microphone}
              width={24}
              height={24}
            />
          </PuiButton>

          {/* Video Toggle (only for video calls) */}
          {isVideoCall && (
            <PuiButton
              onClick={handleToggleVideo}
              sx={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: !isVideoEnabled ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                '&:hover': {
                  background: !isVideoEnabled ? '#dc2626' : 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <PuiSvgIcon
                icon={isVideoEnabled ? PuiIcon.Video : PuiIcon.VideoOff}
                width={24}
                height={24}
              />
            </PuiButton>
          )}

          {/* End Call Button */}
          <PuiButton
            onClick={onEndCall}
            sx={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              '&:hover': {
                background: '#dc2626',
              },
            }}
          >
            <PuiSvgIcon icon={PuiIcon.PhoneOff} width={28} height={28} />
          </PuiButton>
        </PuiStack>
      </PuiStack>
    </PuiStack>
  );
};
