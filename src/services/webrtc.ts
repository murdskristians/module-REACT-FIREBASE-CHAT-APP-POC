import Peer from 'simple-peer';
import type { Instance, SignalData as PeerSignalData } from 'simple-peer';
import {
  sendSignal,
  subscribeToSignals,
  updateCallStatus,
  type CallType,
} from '../firebase/calls';

export type WebRTCCallbacks = {
  onStream?: (stream: MediaStream) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
};

export class WebRTCService {
  private peer: Instance | null = null;
  private callId: string | null = null;
  private userId: string | null = null;
  private remoteUserId: string | null = null;
  private localStream: MediaStream | null = null;
  private unsubscribeSignals: (() => void) | null = null;

  /**
   * Initialize WebRTC connection as the caller (initiator)
   */
  async initiateCall(
    callId: string,
    userId: string,
    remoteUserId: string,
    callType: CallType,
    callbacks: WebRTCCallbacks
  ): Promise<void> {
    this.callId = callId;
    this.userId = userId;
    this.remoteUserId = remoteUserId;

    try {
      // Get local media stream
      this.localStream = await this.getMediaStream(callType);

      // Create peer as initiator
      this.peer = new Peer({
        initiator: true,
        trickle: true,
        stream: this.localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      this.setupPeerEvents(callbacks);
      this.subscribeToRemoteSignals();
    } catch (error) {
      console.error('Error initiating call:', error);
      if (callbacks.onError) {
        callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(
    callId: string,
    userId: string,
    remoteUserId: string,
    callType: CallType,
    callbacks: WebRTCCallbacks
  ): Promise<void> {
    this.callId = callId;
    this.userId = userId;
    this.remoteUserId = remoteUserId;

    try {
      // Get local media stream
      this.localStream = await this.getMediaStream(callType);

      // Create peer as receiver
      this.peer = new Peer({
        initiator: false,
        trickle: true,
        stream: this.localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      this.setupPeerEvents(callbacks);
      this.subscribeToRemoteSignals();

      // Update call status to accepted
      await updateCallStatus(callId, 'accepted');
    } catch (error) {
      console.error('Error answering call:', error);
      if (callbacks.onError) {
        callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Get local media stream (audio/video)
   */
  private async getMediaStream(callType: CallType): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: callType === 'video',
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  /**
   * Setup peer event listeners
   */
  private setupPeerEvents(callbacks: WebRTCCallbacks): void {
    if (!this.peer) return;

    this.peer.on('signal', async (signal: PeerSignalData) => {
      // Send signal to remote peer via Firebase
      console.log('Sending signal:', signal.type);
      if (this.callId && this.userId && this.remoteUserId) {
        try {
          await sendSignal(this.callId, this.userId, this.remoteUserId, signal);
          console.log('Signal sent successfully');
        } catch (error) {
          console.error('Error sending signal:', error);
        }
      }
    });

    this.peer.on('stream', async (stream: MediaStream) => {
      // Received remote stream - this means connection is established
      console.log('Received remote stream');
      if (this.callId) {
        await updateCallStatus(this.callId, 'active');
      }
      if (callbacks.onStream) {
        callbacks.onStream(stream);
      }
      if (callbacks.onConnect) {
        callbacks.onConnect();
      }
    });

    this.peer.on('connect', () => {
      console.log('Peer data channel connected');
    });

    this.peer.on('close', () => {
      console.log('Peer connection closed');
      this.cleanup();
      if (callbacks.onClose) {
        callbacks.onClose();
      }
    });

    this.peer.on('error', (error: Error) => {
      console.error('Peer error:', error);
      this.cleanup();
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    });
  }

  /**
   * Subscribe to remote signals from Firebase
   */
  private subscribeToRemoteSignals(): void {
    if (!this.callId || !this.userId) return;

    console.log('Subscribing to signals for call:', this.callId, 'user:', this.userId);

    this.unsubscribeSignals = subscribeToSignals(
      this.callId,
      this.userId,
      (signalData) => {
        console.log('Received signal from:', signalData.from, 'type:', signalData.signal?.type);
        if (this.peer && signalData.signal) {
          try {
            this.peer.signal(signalData.signal);
            console.log('Signal processed successfully');
          } catch (error) {
            console.error('Error processing signal:', error);
          }
        }
      }
    );
  }

  /**
   * Toggle audio mute
   */
  toggleAudio(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * End the call and cleanup
   */
  async endCall(): Promise<void> {
    if (this.callId) {
      await updateCallStatus(this.callId, 'ended');
    }
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Stop all local media tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Destroy peer connection
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    // Unsubscribe from signals
    if (this.unsubscribeSignals) {
      this.unsubscribeSignals();
      this.unsubscribeSignals = null;
    }

    this.callId = null;
    this.userId = null;
    this.remoteUserId = null;
  }
}
