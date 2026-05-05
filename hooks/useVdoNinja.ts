'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { VdoNinjaIframeController } from '@/lib/streaming/vdo-ninja-iframe';
import type { VdoNinjaIframeEvent } from '@/lib/streaming/vdo-ninja-iframe';

interface UseVdoNinjaOptions {
  containerId: string;
  roomId: string;
  streamId?: string;
  role: 'host' | 'guest' | 'director' | 'scene';
  audioOnly?: boolean;
  meshcast?: boolean;
  enabled?: boolean;
}

export function useVdoNinja(options: UseVdoNinjaOptions) {
  const controllerRef = useRef<VdoNinjaIframeController | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<unknown>(null);
  const [events, setEvents] = useState<VdoNinjaIframeEvent[]>([]);

  useEffect(() => {
    if (!options.enabled || typeof window === 'undefined') return;

    const controller = new VdoNinjaIframeController(options.containerId);

    controller
      .on('joined', () => setIsConnected(true))
      .on('left', () => setIsConnected(false))
      .on('stats', (event) => setStats(event.value))
      .on('*', (event) => setEvents((prev) => [...prev.slice(-50), event]));

    controller.mount({
      containerId: options.containerId,
      roomId: options.roomId,
      streamId: options.streamId,
      role: options.role,
      audioOnly: options.audioOnly,
      meshcast: options.meshcast,
      autostart: true,
    });

    controllerRef.current = controller;

    return () => {
      controller.unmount();
      controllerRef.current = null;
    };
  }, [options.enabled, options.containerId, options.roomId, options.role]);

  const mute = useCallback(() => controllerRef.current?.mute(), []);
  const unmute = useCallback(() => controllerRef.current?.unmute(), []);
  const hideVideo = useCallback(() => controllerRef.current?.hideVideo(), []);
  const showVideo = useCallback(() => controllerRef.current?.showVideo(), []);
  const startRecording = useCallback(() => controllerRef.current?.startRecording(), []);
  const stopRecording = useCallback(() => controllerRef.current?.stopRecording(), []);
  const hangup = useCallback(() => controllerRef.current?.hangup(), []);
  const getStats = useCallback(() => controllerRef.current?.getStats(), []);
  const changeRoom = useCallback((newRoomId: string) => controllerRef.current?.changeRoom(newRoomId), []);

  return {
    isConnected,
    stats,
    events,
    controller: controllerRef.current,
    mute,
    unmute,
    hideVideo,
    showVideo,
    startRecording,
    stopRecording,
    hangup,
    getStats,
    changeRoom,
  };
}
