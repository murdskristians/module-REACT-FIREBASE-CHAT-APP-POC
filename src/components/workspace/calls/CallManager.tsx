import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createCallSession,
  subscribeToCallSession,
  subscribeToIncomingCalls,
  updateCallStatus,
  type CallSession,
  type CallType,
} from '../../../firebase/calls';
import { WebRTCService } from '../../../services/webrtc';
import { ActiveCallView } from './ActiveCallView';
import { IncomingCallModal } from './IncomingCallModal';

interface CallManagerProps {
  userId: string;
  userName: string;
  userAvatar: string | null;
}

export const CallManager: FC<CallManagerProps> = ({
  userId,
  userName,
  userAvatar,
}) => {
  const [incomingCalls, setIncomingCalls] = useState<CallSession[]>([]);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const webrtcService = useRef<WebRTCService>(new WebRTCService());

  // Subscribe to incoming calls
  useEffect(() => {
    const unsubscribe = subscribeToIncomingCalls(userId, (calls) => {
      setIncomingCalls(calls);
    });

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to active call updates
  useEffect(() => {
    if (!activeCall) return;

    const unsubscribe = subscribeToCallSession(activeCall.id, (call) => {
      if (!call) {
        handleCallEnd();
        return;
      }

      setActiveCall(call);

      // Handle call ended by remote user
      if (
        call.status === 'ended' ||
        call.status === 'declined' ||
        call.status === 'failed'
      ) {
        handleCallEnd();
      }
    });

    return () => unsubscribe();
  }, [activeCall?.id]);

  const handleAcceptCall = useCallback(
    async (call: CallSession) => {
      try {
        setActiveCall(call);
        setIncomingCalls((prev) => prev.filter((c) => c.id !== call.id));

        await webrtcService.current.answerCall(
          call.id,
          userId,
          call.callerId,
          call.type,
          {
            onStream: (stream) => {
              setRemoteStream(stream);
            },
            onClose: () => {
              handleCallEnd();
            },
            onError: (error) => {
              console.error('Call error:', error);
              handleCallEnd();
            },
            onConnect: () => {
              setLocalStream(webrtcService.current.getLocalStream());
            },
          }
        );
      } catch (error) {
        console.error('Error accepting call:', error);
        await updateCallStatus(call.id, 'failed');
        setActiveCall(null);
      }
    },
    [userId]
  );

  const handleDeclineCall = useCallback(async (call: CallSession) => {
    await updateCallStatus(call.id, 'declined');
    setIncomingCalls((prev) => prev.filter((c) => c.id !== call.id));
  }, []);

  const handleEndCall = useCallback(async () => {
    if (activeCall) {
      await webrtcService.current.endCall();
    }
    handleCallEnd();
  }, [activeCall]);

  const handleCallEnd = useCallback(() => {
    setActiveCall(null);
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const handleToggleMute = useCallback((muted: boolean) => {
    webrtcService.current.toggleAudio(muted);
  }, []);

  const handleToggleVideo = useCallback((enabled: boolean) => {
    webrtcService.current.toggleVideo(enabled);
  }, []);

  // Expose function to initiate calls
  useEffect(() => {
    // Store in window for access from other components
    (window as any).initiateCall = async (
      receiverId: string,
      receiverName: string,
      receiverAvatar: string | null,
      conversationId: string,
      callType: CallType
    ) => {
      try {
        // Create call session
        const callId = await createCallSession(
          userId,
          userName,
          userAvatar,
          receiverId,
          receiverName,
          receiverAvatar,
          conversationId,
          callType
        );

        // Update to ringing
        await updateCallStatus(callId, 'ringing');

        // Get call session
        const unsubscribe = subscribeToCallSession(callId, async (call) => {
          if (!call) return;

          setActiveCall(call);
          unsubscribe();

          // Initiate WebRTC connection
          await webrtcService.current.initiateCall(
            callId,
            userId,
            receiverId,
            callType,
            {
              onStream: (stream) => {
                setRemoteStream(stream);
              },
              onClose: () => {
                handleCallEnd();
              },
              onError: (error) => {
                console.error('Call error:', error);
                handleCallEnd();
              },
              onConnect: () => {
                setLocalStream(webrtcService.current.getLocalStream());
              },
            }
          );
        });
      } catch (error) {
        console.error('Error initiating call:', error);
      }
    };

    return () => {
      delete (window as any).initiateCall;
    };
  }, [userId, userName, userAvatar, handleCallEnd]);

  return (
    <>
      {/* Incoming Call Modals */}
      {incomingCalls.map((call) => (
        <IncomingCallModal
          key={call.id}
          call={call}
          onAccept={() => handleAcceptCall(call)}
          onDecline={() => handleDeclineCall(call)}
        />
      ))}

      {/* Active Call View */}
      {activeCall && (
        <ActiveCallView
          call={activeCall}
          localStream={localStream}
          remoteStream={remoteStream}
          onEndCall={handleEndCall}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
        />
      )}
    </>
  );
};
