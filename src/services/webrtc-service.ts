import type { PeerConnectionInfo } from '../types/call';
import { PeerConnectionMode } from '../types/call';

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// Public TURN servers (for testing - in production use your own TURN server)
// Using fewer servers to avoid slowdown warnings
const TURN_SERVERS = [
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

const ICE_SERVERS = [...STUN_SERVERS, ...TURN_SERVERS];

export class WebRTCService {
  private peerConnections: Map<string, PeerConnectionInfo> = new Map();
  private localStream: MediaStream | null = null;
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();

  setLocalStream(stream: MediaStream | null): void {
    this.localStream = stream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  createPeerConnection(
    contactId: string,
    mode: PeerConnectionMode,
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    onRemoteStream: (stream: MediaStream) => void
  ): RTCPeerConnection {
    const existingPeer = this.peerConnections.get(contactId);
    if (existingPeer) {
      // If connection exists, check if we have a stream and notify about it
      if (existingPeer.stream) {
        console.log(`Reusing existing peer connection for ${contactId}, stream already exists`);
        // Notify about existing stream immediately
        setTimeout(() => {
          onRemoteStream(existingPeer.stream!);
        }, 0);
      }
      return existingPeer.connection;
    }

    const configuration: RTCConfiguration = {
      iceServers: ICE_SERVERS,
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local tracks if in Send mode
    if (mode === PeerConnectionMode.Send && this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`ICE candidate generated for ${contactId}:`, {
          candidate: event.candidate.candidate?.substring(0, 50) + '...',
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
        onIceCandidate(event.candidate);
      } else {
        console.log(`ICE candidate gathering completed for ${contactId}`);
      }
    };

    peerConnection.ontrack = (event) => {
      console.log(`ontrack event received from ${contactId}:`, {
        trackId: event.track.id,
        trackKind: event.track.kind,
        trackEnabled: event.track.enabled,
        streamsCount: event.streams.length,
      });

      // Get or create stream for this peer connection
      const peerInfo = this.peerConnections.get(contactId);
      let remoteStream: MediaStream | null = null;
      
      if (event.streams && event.streams.length > 0) {
        // Use the stream from the event
        remoteStream = event.streams[0];
      } else if (peerInfo && peerInfo.stream) {
        // Add track to existing stream
        remoteStream = peerInfo.stream;
        // Check if track already exists in stream
        const existingTracks = remoteStream.getTracks();
        const trackExists = existingTracks.some(t => t.id === event.track.id);
        if (!trackExists) {
          remoteStream.addTrack(event.track);
          console.log(`Added ${event.track.kind} track to existing stream for ${contactId}`);
        }
      } else if (event.track) {
        // Create a new stream from the track if no stream exists
        remoteStream = new MediaStream([event.track]);
        console.log(`Created new stream from ${event.track.kind} track for ${contactId}`);
      }

      if (remoteStream) {
        const audioTracks = remoteStream.getAudioTracks();
        const videoTracks = remoteStream.getVideoTracks();
        
        console.log(`Received remote stream from ${contactId}, tracks:`, {
          audio: audioTracks.length,
          video: videoTracks.length,
          streamId: remoteStream.id,
          audioTracks: audioTracks.map(t => ({ id: t.id, enabled: t.enabled, readyState: t.readyState })),
          videoTracks: videoTracks.map(t => ({ id: t.id, enabled: t.enabled, readyState: t.readyState })),
        });

        // Store stream in peer info
        if (peerInfo) {
          peerInfo.stream = remoteStream;
        }

        // Notify about the stream (will trigger state update)
        onRemoteStream(remoteStream);
      } else {
        console.warn(`No remote stream found in ontrack event for ${contactId}`);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state for ${contactId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        console.log(`Connection failed for ${contactId}, attempting to restart ICE`);
        // Try to restart ICE
        try {
          peerConnection.restartIce();
        } catch (error) {
          console.error(`Error restarting ICE for ${contactId}:`, error);
        }
      }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;
      console.log(`ICE connection state for ${contactId}:`, iceState);
      
      if (iceState === 'failed') {
        console.log(`ICE failed for ${contactId}, attempting to restart ICE`);
        try {
          peerConnection.restartIce();
        } catch (error) {
          console.error(`Error restarting ICE for ${contactId}:`, error);
        }
      } else if (iceState === 'disconnected') {
        console.log(`ICE disconnected for ${contactId}, attempting to restart ICE`);
        try {
          peerConnection.restartIce();
        } catch (error) {
          console.error(`Error restarting ICE for ${contactId}:`, error);
        }
      }
    };

    const peerInfo: PeerConnectionInfo = {
      connection: peerConnection,
      contactId,
      mode,
    };

    this.peerConnections.set(contactId, peerInfo);
    return peerConnection;
  }

  async createOffer(contactId: string): Promise<RTCSessionDescriptionInit | null> {
    const peerInfo = this.peerConnections.get(contactId);
    if (!peerInfo) {
      return null;
    }

    try {
      const offer = await peerInfo.connection.createOffer();
      await peerInfo.connection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }

  async createAnswer(
    contactId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | null> {
    const peerInfo = this.peerConnections.get(contactId);
    if (!peerInfo) {
      return null;
    }

    try {
      await peerInfo.connection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Process pending ICE candidates
      const pendingCandidates = this.pendingIceCandidates.get(contactId) || [];
      for (const candidate of pendingCandidates) {
        try {
          await peerInfo.connection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding pending ICE candidate:', error);
        }
      }
      this.pendingIceCandidates.delete(contactId);
      
      const answer = await peerInfo.connection.createAnswer();
      await peerInfo.connection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      return null;
    }
  }

  async setRemoteAnswer(contactId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerInfo = this.peerConnections.get(contactId);
    if (!peerInfo) {
      return;
    }

    try {
      // Check connection state
      const state = peerInfo.connection.signalingState;
      
      // If already in stable state, check if remote description is set
      if (state === 'stable') {
        if (peerInfo.connection.remoteDescription) {
          // Remote description already set, just process pending candidates
          const pendingCandidates = this.pendingIceCandidates.get(contactId) || [];
          for (const candidate of pendingCandidates) {
            try {
              await peerInfo.connection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
              // Ignore errors for invalid candidates
            }
          }
          this.pendingIceCandidates.delete(contactId);
          return;
        }
        // If stable but no remote description, this is an error - we shouldn't be setting answer
        console.warn('Cannot set remote answer: connection is in stable state without remote description');
        return;
      }

      // Check if remote description is already set
      if (peerInfo.connection.remoteDescription) {
        // If remote description is already set, check if it's different
        if (peerInfo.connection.remoteDescription.sdp === answer.sdp) {
          // Same answer, just process pending candidates
          const pendingCandidates = this.pendingIceCandidates.get(contactId) || [];
          for (const candidate of pendingCandidates) {
            try {
              await peerInfo.connection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
              // Ignore errors for invalid candidates
            }
          }
          this.pendingIceCandidates.delete(contactId);
          return;
        }
        // Different answer - this shouldn't happen, but log it
        console.warn('Remote description already set with different SDP');
        return;
      }

      // Only set remote description if we're in have-local-offer state
      if (state !== 'have-local-offer') {
        console.warn(`Cannot set remote answer: connection is in ${state} state, expected have-local-offer`);
        return;
      }

      await peerInfo.connection.setRemoteDescription(new RTCSessionDescription(answer));
      
      console.log(`setRemoteAnswer: Remote description set for ${contactId}, processing ${this.pendingIceCandidates.get(contactId)?.length || 0} pending ICE candidates`);
      
      // Process pending ICE candidates
      const pendingCandidates = this.pendingIceCandidates.get(contactId) || [];
      let processedCount = 0;
      for (const candidate of pendingCandidates) {
        try {
          await peerInfo.connection.addIceCandidate(new RTCIceCandidate(candidate));
          processedCount++;
        } catch (error) {
          console.error(`Error adding pending ICE candidate for ${contactId}:`, error);
        }
      }
      console.log(`setRemoteAnswer: Processed ${processedCount}/${pendingCandidates.length} pending ICE candidates for ${contactId}`);
      this.pendingIceCandidates.delete(contactId);
    } catch (error) {
      // Check if error is about stable state
      if (error instanceof Error && error.message.includes('stable')) {
        // Connection is already stable, just process pending candidates
        const pendingCandidates = this.pendingIceCandidates.get(contactId) || [];
        for (const candidate of pendingCandidates) {
          try {
            await peerInfo.connection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            // Ignore
          }
        }
        this.pendingIceCandidates.delete(contactId);
        return;
      }
      console.error('Error setting remote answer:', error);
    }
  }

  async addIceCandidate(contactId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerInfo = this.peerConnections.get(contactId);
    if (!peerInfo) {
      console.log(`addIceCandidate: No peer connection found for ${contactId}, storing as pending`);
      // Store candidate for later
      const pending = this.pendingIceCandidates.get(contactId) || [];
      pending.push(candidate);
      this.pendingIceCandidates.set(contactId, pending);
      return;
    }

    // Check if remote description is set
    if (!peerInfo.connection.remoteDescription) {
      console.log(`addIceCandidate: Remote description not set for ${contactId}, storing as pending`);
      const pending = this.pendingIceCandidates.get(contactId) || [];
      pending.push(candidate);
      this.pendingIceCandidates.set(contactId, pending);
      return;
    }

    try {
      console.log(`addIceCandidate: Adding ICE candidate for ${contactId}:`, {
        candidate: candidate.candidate?.substring(0, 50) + '...',
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
      });
      await peerInfo.connection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`addIceCandidate: Successfully added ICE candidate for ${contactId}`);
    } catch (error) {
      // If candidate is invalid or duplicate, just log and continue
      if (error instanceof Error && error.message.includes('Unknown ufrag')) {
        // This can happen if candidate is for a different session, ignore it
        return;
      }
      console.error('Error adding ICE candidate:', error);
    }
  }

  getPeerConnection(contactId: string): RTCPeerConnection | null {
    const peerInfo = this.peerConnections.get(contactId);
    return peerInfo ? peerInfo.connection : null;
  }

  getPeerConnectionInfo(contactId: string): PeerConnectionInfo | null {
    return this.peerConnections.get(contactId) || null;
  }

  closePeerConnection(contactId: string): void {
    const peerInfo = this.peerConnections.get(contactId);
    if (peerInfo) {
      peerInfo.connection.close();
      this.peerConnections.delete(contactId);
    }
  }

  closeAllPeerConnections(): void {
    this.peerConnections.forEach((peerInfo) => {
      peerInfo.connection.close();
    });
    this.peerConnections.clear();
  }

  updateLocalTracks(): void {
    if (!this.localStream) {
      return;
    }

    this.peerConnections.forEach((peerInfo) => {
      if (peerInfo.mode === PeerConnectionMode.Send) {
        const senders = peerInfo.connection.getSenders();
        const videoTrack = this.localStream!.getVideoTracks()[0];
        const audioTrack = this.localStream!.getAudioTracks()[0];

        if (videoTrack) {
          const videoSender = senders.find((s) => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(videoTrack);
          }
        }

        if (audioTrack) {
          const audioSender = senders.find((s) => s.track?.kind === 'audio');
          if (audioSender) {
            audioSender.replaceTrack(audioTrack);
          }
        }
      }
    });
  }
}

