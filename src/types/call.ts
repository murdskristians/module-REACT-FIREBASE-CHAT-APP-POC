export enum CallMessageType {
  Join = 'join',
  CallInvitation = 'call-invitation',
  HangUp = 'hang-up',
  Offer = 'offer',
  Answer = 'answer',
  IceCandidate = 'ice-candidate',
  MicToggled = 'mic-toggled',
  CameraToggled = 'camera-toggled',
  CallEnded = 'call-ended',
}

export interface IceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment?: string;
}

export interface CallRoom {
  id: string;
  conversationId: string;
  group?: boolean;
  participants: string[]; // User IDs
  createdAt: number;
  endedAt?: number;
}

export interface SignallingMessage {
  type: CallMessageType;
  roomId: string;
  senderId: string;
  recipientContactId?: string;
  conversationId?: string;
  sdp?: string;
  candidate?: IceCandidate;
  audioMuted?: boolean;
  videoEnabled?: boolean;
  group?: boolean;
  room?: CallRoom;
  timestamp: number;
}

export enum PeerConnectionMode {
  Send = 'send',
  Receive = 'receive',
}

export interface PeerConnectionInfo {
  connection: RTCPeerConnection;
  contactId: string;
  mode: PeerConnectionMode;
  stream?: MediaStream;
}

export interface CallState {
  roomId: string | null;
  conversationId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  isCalling: boolean; // Incoming call
  isCaller: boolean;
  isGroup: boolean;
  audioMuted: boolean;
  videoEnabled: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participantIds: string[];
  callingMessage: SignallingMessage | null;
  connectedParticipants: Set<string>;
}

