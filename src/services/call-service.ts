import { WebRTCService } from './webrtc-service';
import {
  createCallRoom,
  sendCallMessage,
  subscribeToCallMessages,
  subscribeToIncomingCalls,
  sendCallInvitation,
  endCallRoom,
  getCallRoom,
} from '../firebase/calls';
import { auth } from '../firebase/index';
import type {
  SignallingMessage,
  CallState,
} from '../types/call';
import { CallMessageType, PeerConnectionMode } from '../types/call';

export class CallService {
  private webrtcService: WebRTCService;
  private callState: CallState;
  private unsubscribeCallMessages: (() => void) | null = null;
  private unsubscribeIncomingCalls: (() => void) | null = null;
  private onStateChange: ((state: CallState) => void) | null = null;

  constructor() {
    this.webrtcService = new WebRTCService();
    this.callState = {
      roomId: null,
      conversationId: null,
      isConnecting: false,
      isConnected: false,
      isCalling: false,
      isCaller: false,
      isGroup: false,
      audioMuted: false,
      videoEnabled: false,
      localStream: null,
      remoteStreams: new Map(),
      participantIds: [],
      callingMessage: null,
      connectedParticipants: new Set(),
    };
  }

  setStateChangeCallback(callback: (state: CallState) => void): void {
    this.onStateChange = callback;
  }

  private updateState(updates: Partial<CallState>): void {
    this.callState = { ...this.callState, ...updates };
    if (this.onStateChange) {
      this.onStateChange(this.callState);
    }
  }

  getState(): CallState {
    return { ...this.callState };
  }

  async initializeCall(
    roomId: string | undefined,
    conversationId: string,
    isCaller: boolean,
    isGroup: boolean
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to initialize a call');
    }

    // Clear calling state if accepting a call
    if (!isCaller) {
      this.updateState({
        isCalling: false,
        callingMessage: null,
      });
    }

    // Add current user to participants
    if (currentUser && !this.callState.participantIds.includes(currentUser.uid)) {
      this.updateState({
        participantIds: [...this.callState.participantIds, currentUser.uid],
      });
    }

    let finalRoomId = roomId;

    // Create room if it doesn't exist
    if (!finalRoomId) {
      // Get conversation participants
      const conversation = await this.getConversation(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      finalRoomId = await createCallRoom({
        conversationId,
        participants: conversation.participants,
        group: isGroup,
      });
    }

    // Initialize local media stream
    await this.initializeLocalStream();

    // Update state
    this.updateState({
      roomId: finalRoomId,
      conversationId,
      isCaller,
      isGroup,
      isConnecting: true,
    });

    // Subscribe to call messages
    this.subscribeToRoom(finalRoomId);

    // Join the room
    await this.joinRoom(finalRoomId, isGroup);

    // If caller, send invitations to other participants
    if (isCaller) {
      const room = await getCallRoom(finalRoomId);
      if (room) {
        const otherParticipants = room.participants.filter((id) => id !== currentUser.uid);
        for (const participantId of otherParticipants) {
          await sendCallInvitation(finalRoomId, conversationId, participantId, currentUser.uid, isGroup);
        }
      }
    }
  }

  private async getConversation(conversationId: string) {
    const { db } = await import('../firebase/index');
    const doc = await db.collection('conversations').doc(conversationId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as { participants: string[] };
  }

  private async initializeLocalStream(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      this.webrtcService.setLocalStream(stream);
      this.updateState({
        localStream: stream,
        videoEnabled: true,
        audioMuted: false,
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  private subscribeToRoom(roomId: string): void {
    if (this.unsubscribeCallMessages) {
      this.unsubscribeCallMessages();
    }

    this.unsubscribeCallMessages = subscribeToCallMessages(roomId, (message) => {
      this.handleCallMessage(message);
    });
  }

  private async joinRoom(roomId: string, isGroup: boolean): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }

    // Ensure current user is in participants list
    if (!this.callState.participantIds.includes(currentUser.uid)) {
      this.updateState({
        participantIds: [...this.callState.participantIds, currentUser.uid],
      });
    }

    const joinMessage: SignallingMessage = {
      type: CallMessageType.Join,
      roomId,
      senderId: currentUser.uid,
      timestamp: Date.now(),
      group: isGroup,
    };

    await sendCallMessage(joinMessage);
  }

  private async handleCallMessage(message: SignallingMessage): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }

    // Ignore messages from ourselves (except for debugging)
    if (message.senderId === currentUser.uid) {
      // Only process our own messages if they are for debugging or special cases
      return;
    }

    switch (message.type) {
      case CallMessageType.Join:
        await this.handleParticipantJoin(message);
        break;
      case CallMessageType.Offer:
        await this.handleOffer(message);
        break;
      case CallMessageType.Answer:
        await this.handleAnswer(message);
        break;
      case CallMessageType.IceCandidate:
        await this.handleIceCandidate(message);
        break;
      case CallMessageType.HangUp:
        await this.handleHangUp(message);
        break;
      case CallMessageType.CallEnded:
        await this.handleCallEnded(message);
        break;
    }
  }

  private async handleParticipantJoin(message: SignallingMessage): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || !this.callState.roomId) {
      return;
    }

    // Check if participant is already in the list
    if (this.callState.participantIds.includes(message.senderId)) {
      return;
    }

    this.updateState({
      participantIds: [...this.callState.participantIds, message.senderId],
    });

    // Create peer connection and send offer
    await this.createAndSendOffer(message.senderId, this.callState.roomId);
  }

  private async createAndSendOffer(contactId: string, roomId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }

    // For 1-on-1 calls, both participants use Send mode (bidirectional)
    // For group calls, use Receive mode (SFU-like architecture)
    const mode = this.callState.isGroup
      ? PeerConnectionMode.Receive
      : PeerConnectionMode.Send;

    this.webrtcService.createPeerConnection(
      contactId,
      mode,
      (candidate) => this.sendIceCandidate(contactId, roomId, candidate),
      (stream) => {
        console.log(`CallService: Received remote stream from ${contactId} in createAndSendOffer:`, {
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
          streamId: stream.id,
        });
        
        // Always update the stream, even if it already exists (tracks may have been added)
        const remoteStreams = new Map(this.callState.remoteStreams);
        remoteStreams.set(contactId, stream);
        
        console.log(`CallService: Updating remote streams, total: ${remoteStreams.size}`);
        this.updateState({ remoteStreams });
        
        // Also update connected participants
        const connectedParticipants = new Set(this.callState.connectedParticipants);
        connectedParticipants.add(contactId);
        this.updateState({ connectedParticipants });
      }
    );

    const offer = await this.webrtcService.createOffer(contactId);
    if (offer) {
      const offerMessage: SignallingMessage = {
        type: CallMessageType.Offer,
        sdp: offer.sdp || '',
        roomId,
        senderId: currentUser.uid,
        recipientContactId: contactId,
        group: this.callState.isGroup,
        timestamp: Date.now(),
      };

      await sendCallMessage(offerMessage);
    }
  }

  private async handleOffer(message: SignallingMessage): Promise<void> {
    if (!message.sdp || !this.callState.roomId) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }

    // Check if peer connection already exists
    const existingConnection = this.webrtcService.getPeerConnection(message.senderId);
    if (existingConnection) {
      // Connection already exists, check if we have a stream
      const existingStream = this.callState.remoteStreams.get(message.senderId);
      if (existingStream) {
        console.log(`Peer connection and stream for ${message.senderId} already exist, skipping offer handling`);
        return;
      }
      // Connection exists but no stream - this shouldn't happen, but try to get stream from peer info
      const peerInfo = this.webrtcService.getPeerConnectionInfo(message.senderId);
      if (peerInfo?.stream) {
        console.log(`Found existing stream in peer info for ${message.senderId}, updating state`);
        const remoteStreams = new Map(this.callState.remoteStreams);
        remoteStreams.set(message.senderId, peerInfo.stream);
        this.updateState({ remoteStreams });
        return;
      }
      console.log(`Peer connection for ${message.senderId} exists but no stream found, will process offer to get stream`);
    }

    // For 1-on-1 calls, both participants use Send mode (bidirectional)
    // For group calls, use Receive mode (SFU-like architecture)
    const mode = this.callState.isGroup
      ? PeerConnectionMode.Receive
      : PeerConnectionMode.Send;

    // Store callback to update state when stream is received
    const onStreamReceived = (stream: MediaStream) => {
      console.log(`CallService: Received remote stream from ${message.senderId} in handleOffer:`, {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
        streamId: stream.id,
      });
      
      // Always update the stream, even if it already exists (tracks may have been added)
      const remoteStreams = new Map(this.callState.remoteStreams);
      remoteStreams.set(message.senderId, stream);
      
      console.log(`CallService: Updating remote streams in handleOffer, total: ${remoteStreams.size}`);
      this.updateState({ remoteStreams });
      
      // Also update connected participants
      const connectedParticipants = new Set(this.callState.connectedParticipants);
      connectedParticipants.add(message.senderId);
      this.updateState({ connectedParticipants });
    };

    this.webrtcService.createPeerConnection(
      message.senderId,
      mode,
      (candidate) => this.sendIceCandidate(message.senderId, message.roomId, candidate),
      onStreamReceived
    );

    const answer = await this.webrtcService.createAnswer(message.senderId, {
      type: 'offer',
      sdp: message.sdp,
    });

    if (answer) {
      const answerMessage: SignallingMessage = {
        type: CallMessageType.Answer,
        sdp: answer.sdp || '',
        roomId: message.roomId,
        senderId: currentUser.uid,
        recipientContactId: message.senderId,
        group: this.callState.isGroup,
        timestamp: Date.now(),
      };

      await sendCallMessage(answerMessage);

      // Add sender to participants if not already added
      if (!this.callState.participantIds.includes(message.senderId)) {
        this.updateState({
          participantIds: [...this.callState.participantIds, message.senderId],
        });
      }

      const connectedParticipants = new Set(this.callState.connectedParticipants);
      connectedParticipants.add(message.senderId);
      this.updateState({ connectedParticipants });
    }
  }

  private async handleAnswer(message: SignallingMessage): Promise<void> {
    if (!message.sdp) {
      return;
    }

    // Add sender to participants if not already added
    if (!this.callState.participantIds.includes(message.senderId)) {
      this.updateState({
        participantIds: [...this.callState.participantIds, message.senderId],
      });
    }

    await this.webrtcService.setRemoteAnswer(message.senderId, {
      type: 'answer',
      sdp: message.sdp,
    });

    const connectedParticipants = new Set(this.callState.connectedParticipants);
    connectedParticipants.add(message.senderId);
    this.updateState({
      connectedParticipants,
      isConnected: true,
      isConnecting: false,
    });
  }

  private async handleIceCandidate(message: SignallingMessage): Promise<void> {
    if (!message.candidate) {
      return;
    }

    // Ignore ICE candidates from ourselves
    const currentUser = auth.currentUser;
    if (currentUser && message.senderId === currentUser.uid) {
      return;
    }

    const candidate: RTCIceCandidateInit = {
      candidate: message.candidate.candidate,
      sdpMid: message.candidate.sdpMid || null,
      sdpMLineIndex: message.candidate.sdpMLineIndex || null,
      usernameFragment: message.candidate.usernameFragment,
    };

    await this.webrtcService.addIceCandidate(message.senderId, candidate);
  }

  private async sendIceCandidate(
    contactId: string,
    roomId: string,
    candidate: RTCIceCandidate
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return;
    }

    const iceCandidate = {
      candidate: candidate.candidate || '',
      sdpMid: candidate.sdpMid || null,
      sdpMLineIndex: candidate.sdpMLineIndex || null,
      usernameFragment: candidate.usernameFragment,
    };

    const candidateMessage: SignallingMessage = {
      type: CallMessageType.IceCandidate,
      candidate: iceCandidate,
      roomId,
      senderId: currentUser.uid,
      recipientContactId: contactId,
      group: this.callState.isGroup,
      timestamp: Date.now(),
    };

    await sendCallMessage(candidateMessage);
  }

  private async handleHangUp(message: SignallingMessage): Promise<void> {
    this.webrtcService.closePeerConnection(message.senderId);

    const participantIds = this.callState.participantIds.filter(
      (id) => id !== message.senderId
    );
    const remoteStreams = new Map(this.callState.remoteStreams);
    remoteStreams.delete(message.senderId);
    const connectedParticipants = new Set(this.callState.connectedParticipants);
    connectedParticipants.delete(message.senderId);

    this.updateState({
      participantIds,
      remoteStreams,
      connectedParticipants,
    });
  }

  private async handleCallEnded(message: SignallingMessage): Promise<void> {
    await this.endCall();
  }

  async toggleAudio(): Promise<void> {
    if (!this.callState.localStream) {
      return;
    }

    const audioTracks = this.callState.localStream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = this.callState.audioMuted;
    });

    this.updateState({
      audioMuted: !this.callState.audioMuted,
    });

    this.webrtcService.updateLocalTracks();
  }

  async toggleVideo(): Promise<void> {
    if (!this.callState.localStream) {
      return;
    }

    const videoTracks = this.callState.localStream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !this.callState.videoEnabled;
    });

    this.updateState({
      videoEnabled: !this.callState.videoEnabled,
    });

    this.webrtcService.updateLocalTracks();
  }

  async endCall(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || !this.callState.roomId) {
      return;
    }

    // Send hang up message
    const hangUpMessage: SignallingMessage = {
      type: CallMessageType.HangUp,
      roomId: this.callState.roomId,
      senderId: currentUser.uid,
      timestamp: Date.now(),
    };

    await sendCallMessage(hangUpMessage);

    // End the room
    await endCallRoom(this.callState.roomId);

    // Cleanup
    this.cleanup();
  }

  async declineCall(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || !this.callState.callingMessage) {
      return;
    }

    const hangUpMessage: SignallingMessage = {
      type: CallMessageType.HangUp,
      roomId: this.callState.callingMessage.roomId,
      senderId: currentUser.uid,
      recipientContactId: this.callState.callingMessage.senderId,
      timestamp: Date.now(),
    };

    await sendCallMessage(hangUpMessage);

    // Clear calling state immediately
    this.updateState({
      isCalling: false,
      callingMessage: null,
    });
  }

  private cleanup(): void {
    // Stop local stream
    if (this.callState.localStream) {
      this.callState.localStream.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections
    this.webrtcService.closeAllPeerConnections();

    // Unsubscribe from messages
    if (this.unsubscribeCallMessages) {
      this.unsubscribeCallMessages();
      this.unsubscribeCallMessages = null;
    }

    if (this.unsubscribeIncomingCalls) {
      this.unsubscribeIncomingCalls();
      this.unsubscribeIncomingCalls = null;
    }

    // Reset state
    this.updateState({
      roomId: null,
      conversationId: null,
      isConnecting: false,
      isConnected: false,
      isCalling: false,
      isCaller: false,
      isGroup: false,
      audioMuted: false,
      videoEnabled: false,
      localStream: null,
      remoteStreams: new Map(),
      participantIds: [],
      callingMessage: null,
      connectedParticipants: new Set(),
    });
  }

  subscribeToIncomingCalls(userId: string): void {
    if (this.unsubscribeIncomingCalls) {
      this.unsubscribeIncomingCalls();
    }

    this.unsubscribeIncomingCalls = subscribeToIncomingCalls(userId, async (message) => {
      // Don't show invitation if we're already in a call or connecting
      if (this.callState.isConnecting || this.callState.isConnected || this.callState.roomId) {
        return;
      }

      // Double-check room status before showing invitation
      if (message.roomId) {
        try {
          const room = await getCallRoom(message.roomId);
          if (!room || room.endedAt) {
            console.log('Ignoring call invitation for ended room:', message.roomId);
            return;
          }
        } catch (error) {
          console.error('Error checking room status in subscribeToIncomingCalls:', error);
          // Continue processing if we can't check room status
        }
      }

      // Only show invitation if we're not already calling
      if (!this.callState.isCalling) {
        this.updateState({
          isCalling: true,
          callingMessage: message,
        });
      }
    });
  }
}

// Singleton instance
export const callService = new CallService();

