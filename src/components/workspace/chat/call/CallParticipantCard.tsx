import { PuiBox, PuiIcon, PuiSvgIcon, PuiTypography, useTheme } from 'piche.ui';
import { FC, useMemo } from 'react';
import { Avatar } from '../../shared/Avatar';
import { VideoPlayer } from './VideoPlayer';
import type { Contact } from '../../../../firebase/users';

interface CallParticipantCardProps {
  contact: Contact;
  stream: MediaStream | null;
  isLocal: boolean;
  isMuted: boolean;
  hasVideo: boolean;
}

export const CallParticipantCard: FC<CallParticipantCardProps> = ({
  contact,
  stream,
  isLocal,
  isMuted,
  hasVideo,
}) => {
  const theme = useTheme();

  const cameraStream = useMemo(() => {
    if (!stream) {
      console.log(`CallParticipantCard: No stream for ${contact.name}`);
      return null;
    }
    
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    console.log(`CallParticipantCard: Stream for ${contact.name}:`, {
      videoTracks: videoTracks.length,
      audioTracks: audioTracks.length,
      hasVideo,
    });
    
    if (videoTracks.length === 0) {
      console.log(`CallParticipantCard: No video tracks for ${contact.name}`);
      return null;
    }
    
    // Filter out disabled tracks
    const enabledVideoTracks = videoTracks.filter((track) => track.enabled);
    if (enabledVideoTracks.length === 0) {
      console.log(`CallParticipantCard: No enabled video tracks for ${contact.name}`);
      return null;
    }
    
    // Create a stream with all enabled video tracks
    // Note: We don't include audio tracks here because audio is handled separately in CallView
    const cameraStream = new MediaStream();
    enabledVideoTracks.forEach((track) => cameraStream.addTrack(track));
    
    console.log(`CallParticipantCard: Created camera stream for ${contact.name} with ${enabledVideoTracks.length} video tracks`);
    return cameraStream;
  }, [stream, hasVideo, contact.name]);

  return (
    <PuiBox
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: theme.palette.grey[800],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Microphone icon */}
      <PuiBox
        sx={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          zIndex: 10,
          padding: '4px',
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <PuiSvgIcon
          icon={isMuted ? PuiIcon.MicrophoneOff : PuiIcon.Microphone}
          width={16}
          height={16}
          stroke="white"
        />
      </PuiBox>

      {/* Video or Avatar */}
      {hasVideo && cameraStream ? (
        <VideoPlayer stream={cameraStream} isLocal={isLocal} muted={isLocal} />
      ) : (
        <Avatar name={contact.name} avatarUrl={contact.avatarUrl} size={120} />
      )}

      {/* Name */}
      <PuiBox
        sx={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          right: '8px',
          zIndex: 10,
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <PuiTypography variant="body-sm-medium" sx={{ color: 'white' }}>
          {isLocal ? 'You' : contact.name}
        </PuiTypography>
      </PuiBox>
    </PuiBox>
  );
};

