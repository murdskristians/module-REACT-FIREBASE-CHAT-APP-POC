import { PuiBox, PuiModalBase, useTheme } from 'piche.ui';
import { FC, useMemo, useEffect, useRef } from 'react';
import { CallParticipantCard } from './CallParticipantCard';
import { CallBottomPanel } from './CallBottomPanel';
import type { CallState } from '../../../../types/call';
import type { Contact } from '../../../../firebase/users';
import { auth } from '../../../../firebase/index';

interface CallViewProps {
  callState: CallState;
  contacts: Map<string, Contact>;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

const GRID_LAYOUTS = [
  { max: 1, columns: 1, rows: 1 },
  { max: 2, columns: 2, rows: 1 },
  { max: 3, columns: 3, rows: 1 },
  { max: 4, columns: 2, rows: 2 },
  { max: 6, columns: 3, rows: 2 },
  { max: 8, columns: 4, rows: 2 },
  { max: 9, columns: 3, rows: 3 },
  { max: 12, columns: 4, rows: 3 },
];

const calculateGridLayout = (participantCount: number) => {
  const layout = GRID_LAYOUTS.find((config) => participantCount <= config.max);
  return layout ? { columns: layout.columns, rows: layout.rows } : { columns: 4, rows: 3 };
};

export const CallView: FC<CallViewProps> = ({
  callState,
  contacts,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}) => {
  const theme = useTheme();
  const currentUser = auth.currentUser;
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Handle remote audio streams
  useEffect(() => {
    // Copy ref value at the start of the effect to avoid stale closure
    const audioElements = audioElementsRef.current;
    
    callState.remoteStreams.forEach((stream, contactId) => {
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      
      console.log(`CallView: Processing stream for ${contactId}:`, {
        audioTracks: audioTracks.length,
        videoTracks: videoTracks.length,
        streamId: stream.id,
      });

      // Setup audio element for audio tracks
      if (audioTracks.length > 0) {
        console.log(`CallView: Setting up audio for ${contactId} with ${audioTracks.length} audio tracks`);
        
        let audioElement = audioElements.get(contactId);
        if (!audioElement) {
          audioElement = new Audio();
          audioElement.autoplay = true;
          audioElement.playsInline = true;
          audioElement.muted = false;
          audioElements.set(contactId, audioElement);
        }
        
        // Update audio source if stream changed
        if (audioElement.srcObject !== stream) {
          console.log(`CallView: Updating audio srcObject for ${contactId}`);
          audioElement.srcObject = stream;
          audioElement.play().catch((error) => {
            console.error(`CallView: Error playing audio for ${contactId}:`, error);
          });
        }
      } else {
        console.log(`CallView: No audio tracks for ${contactId}, skipping audio setup`);
      }
    });

    // Cleanup removed streams
    audioElements.forEach((audioElement, contactId) => {
      if (!callState.remoteStreams.has(contactId)) {
        audioElement.srcObject = null;
        audioElements.delete(contactId);
      }
    });

    return () => {
      // Use the copied value in cleanup
      audioElements.forEach((audioElement) => {
        audioElement.srcObject = null;
      });
      audioElements.clear();
    };
  }, [callState.remoteStreams]);

  const participants = useMemo(() => {
    // Get unique participant IDs (current user + all others)
    const allParticipantIds = new Set<string>();
    if (currentUser?.uid) {
      allParticipantIds.add(currentUser.uid);
    }
    callState.participantIds.forEach(id => allParticipantIds.add(id));

    console.log('CallView: All participant IDs:', Array.from(allParticipantIds));
    console.log('CallView: Remote streams:', Array.from(callState.remoteStreams.keys()));
    console.log('CallView: Local stream:', callState.localStream ? 'present' : 'null');

    return Array.from(allParticipantIds).map((participantId) => {
      const isLocal = participantId === currentUser?.uid;
      const contact = contacts.get(participantId);
      const stream = isLocal ? callState.localStream : callState.remoteStreams.get(participantId) || null;

      console.log(`CallView: Participant ${participantId} (${isLocal ? 'local' : 'remote'}):`, {
        hasContact: !!contact,
        hasStream: !!stream,
        videoTracks: stream ? stream.getVideoTracks().length : 0,
        audioTracks: stream ? stream.getAudioTracks().length : 0,
      });

      if (!contact) {
        console.warn(`CallView: No contact found for participant ${participantId}`);
        return null;
      }

      const hasVideo = stream
        ? stream.getVideoTracks().length > 0 && stream.getVideoTracks().some((track) => track.enabled)
        : false;
      const isMuted = isLocal
        ? callState.audioMuted
        : stream
        ? stream.getAudioTracks().length === 0 || stream.getAudioTracks().every((track) => !track.enabled)
        : true;

      return {
        id: participantId,
        contact,
        stream,
        isLocal,
        hasVideo,
        isMuted,
      };
    }).filter(Boolean) as Array<{
      id: string;
      contact: Contact;
      stream: MediaStream | null;
      isLocal: boolean;
      hasVideo: boolean;
      isMuted: boolean;
    }>;
  }, [callState.participantIds, callState.remoteStreams, callState.localStream, callState.audioMuted, contacts, currentUser]);

  if (!callState.isConnected && !callState.isConnecting) {
    return null;
  }

  const gridLayout = calculateGridLayout(participants.length);

  return (
    <PuiModalBase open>
      <PuiBox
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.grey[900],
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Participants grid */}
        <PuiBox
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(${gridLayout.columns}, 1fr)`,
            gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
            gap: '8px',
            padding: '16px',
            overflow: 'auto',
          }}
        >
          {participants.map((participant) => (
            <CallParticipantCard
              key={participant.id}
              contact={participant.contact}
              stream={participant.stream}
              isLocal={participant.isLocal}
              isMuted={participant.isMuted}
              hasVideo={participant.hasVideo}
            />
          ))}
        </PuiBox>

        {/* Bottom panel */}
        <CallBottomPanel
          audioMuted={callState.audioMuted}
          videoEnabled={callState.videoEnabled}
          onToggleAudio={onToggleAudio}
          onToggleVideo={onToggleVideo}
          onEndCall={onEndCall}
        />
      </PuiBox>
    </PuiModalBase>
  );
};

