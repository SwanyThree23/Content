'use client';

// WebRTC peer-to-peer signaling hook
// Used for direct peer connections (fallback when VDO.ninja iframe isn't suitable)

import { useEffect, useRef, useState, useCallback } from 'react';

type SignalingMessage =
  | { type: 'offer'; sdp: RTCSessionDescriptionInit; from: string; to: string }
  | { type: 'answer'; sdp: RTCSessionDescriptionInit; from: string; to: string }
  | { type: 'ice'; candidate: RTCIceCandidateInit; from: string; to: string }
  | { type: 'join'; peerId: string; roomId: string }
  | { type: 'leave'; peerId: string };

interface UseWebRTCOptions {
  roomId: string;
  peerId: string;
  signalingUrl?: string;
  onStreamAdded?: (peerId: string, stream: MediaStream) => void;
  onStreamRemoved?: (peerId: string) => void;
  onPeerJoined?: (peerId: string) => void;
  onPeerLeft?: (peerId: string) => void;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC({
  roomId,
  peerId,
  signalingUrl,
  onStreamAdded,
  onStreamRemoved,
  onPeerJoined,
  onPeerLeft,
}: UseWebRTCOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendSignal = useCallback((msg: SignalingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const createPeerConnection = useCallback(
    (remotePeerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

      // Add local tracks
      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      // ICE candidates
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          sendSignal({ type: 'ice', candidate: candidate.toJSON(), from: peerId, to: remotePeerId });
        }
      };

      // Remote stream
      pc.ontrack = ({ streams }) => {
        if (streams[0]) {
          onStreamAdded?.(remotePeerId, streams[0]);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          peersRef.current.delete(remotePeerId);
          setConnectedPeers((p) => p.filter((id) => id !== remotePeerId));
          onStreamRemoved?.(remotePeerId);
        }
      };

      peersRef.current.set(remotePeerId, pc);
      return pc;
    },
    [peerId, sendSignal, onStreamAdded, onStreamRemoved]
  );

  const handleSignal = useCallback(
    async (msg: SignalingMessage) => {
      if (msg.type === 'join') {
        onPeerJoined?.(msg.peerId);
        setConnectedPeers((p) => [...p, msg.peerId]);

        // Initiate offer
        const pc = createPeerConnection(msg.peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal({ type: 'offer', sdp: offer, from: peerId, to: msg.peerId });
      } else if (msg.type === 'leave') {
        peersRef.current.get(msg.peerId)?.close();
        peersRef.current.delete(msg.peerId);
        setConnectedPeers((p) => p.filter((id) => id !== msg.peerId));
        onPeerLeft?.(msg.peerId);
      } else if (msg.type === 'offer' && msg.to === peerId) {
        const pc = createPeerConnection(msg.from);
        await pc.setRemoteDescription(msg.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: 'answer', sdp: answer, from: peerId, to: msg.from });
      } else if (msg.type === 'answer' && msg.to === peerId) {
        await peersRef.current.get(msg.from)?.setRemoteDescription(msg.sdp);
      } else if (msg.type === 'ice' && msg.to === peerId) {
        await peersRef.current.get(msg.from)?.addIceCandidate(msg.candidate);
      }
    },
    [peerId, createPeerConnection, sendSignal, onPeerJoined, onPeerLeft]
  );

  const connect = useCallback(
    (stream: MediaStream) => {
      localStreamRef.current = stream;

      const wsUrl = signalingUrl || `${process.env.NEXT_PUBLIC_WS_URL || 'wss://your-signaling-server.railway.app'}/ws/${roomId}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          sendSignal({ type: 'join', peerId, roomId });
        };

        ws.onmessage = (e) => {
          try {
            handleSignal(JSON.parse(e.data));
          } catch { /* ignore malformed */ }
        };

        ws.onerror = () => setError('WebSocket connection failed');
        ws.onclose = () => {
          setIsConnected(false);
          setConnectedPeers([]);
        };
      } catch (err) {
        setError('Failed to connect to signaling server');
      }
    },
    [roomId, peerId, signalingUrl, sendSignal, handleSignal]
  );

  const disconnect = useCallback(() => {
    sendSignal({ type: 'leave', peerId });
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    wsRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setIsConnected(false);
    setConnectedPeers([]);
  }, [peerId, sendSignal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    connectedPeers,
    error,
    localStream: localStreamRef.current,
  };
}
