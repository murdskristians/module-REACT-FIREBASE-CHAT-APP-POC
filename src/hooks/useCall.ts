import { useState, useEffect, useCallback } from 'react';
import { callService } from '../services/call-service';
import type { CallState } from '../types/call';
import { auth } from '../firebase/index';

export function useCall() {
  const [callState, setCallState] = useState<CallState>(callService.getState());

  useEffect(() => {
    callService.setStateChangeCallback((state) => {
      setCallState({ ...state });
    });

    // Subscribe to incoming calls
    const currentUser = auth.currentUser;
    if (currentUser) {
      callService.subscribeToIncomingCalls(currentUser.uid);
    }

    return () => {
      callService.setStateChangeCallback(() => {});
    };
  }, []);

  const startCall = useCallback(
    async (conversationId: string, isGroup: boolean = false) => {
      try {
        await callService.initializeCall(undefined, conversationId, true, isGroup);
      } catch (error) {
        console.error('Error starting call:', error);
        throw error;
      }
    },
    []
  );

  const acceptCall = useCallback(async () => {
    const callingMessage = callState.callingMessage;
    if (!callingMessage) {
      return;
    }

    try {
      await callService.initializeCall(
        callingMessage.roomId,
        callingMessage.conversationId || '',
        false,
        callingMessage.group || callingMessage.room?.group || false
      );
    } catch (error) {
      console.error('Error accepting call:', error);
      throw error;
    }
  }, [callState.callingMessage]);

  const declineCall = useCallback(async () => {
    try {
      await callService.declineCall();
    } catch (error) {
      console.error('Error declining call:', error);
      throw error;
    }
  }, []);

  const endCall = useCallback(async () => {
    try {
      await callService.endCall();
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }, []);

  const toggleAudio = useCallback(async () => {
    try {
      await callService.toggleAudio();
    } catch (error) {
      console.error('Error toggling audio:', error);
      throw error;
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    try {
      await callService.toggleVideo();
    } catch (error) {
      console.error('Error toggling video:', error);
      throw error;
    }
  }, []);

  return {
    callState,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
}

