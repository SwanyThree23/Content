'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  requestCameraAndMic,
  requestScreenShare,
  enumerateDevices,
  detectBrowser,
  detectOS,
  PERMISSION_ERRORS,
  getBrowserFixInstructions,
} from '@/lib/device-permissions';
import type { PermissionErrorState, DevicePermissionResult } from '@/lib/types';

interface DevicePermissionsProps {
  onGranted: (stream: MediaStream, devices: MediaDeviceInfo[]) => void;
  onDenied?: (error: PermissionErrorState) => void;
  mode?: 'camera-mic' | 'screen' | 'audio-only';
}

export function DevicePermissions({ onGranted, onDenied, mode = 'camera-mic' }: DevicePermissionsProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'error'>('idle');
  const [error, setError] = useState<PermissionErrorState | null>(null);
  const [devices, setDevices] = useState<{ cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] } | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [testStream, setTestStream] = useState<MediaStream | null>(null);

  const browser = typeof window !== 'undefined' ? detectBrowser() : 'unknown';
  const os = typeof window !== 'undefined' ? detectOS() : 'unknown';

  const requestAccess = useCallback(async () => {
    setStatus('requesting');
    setError(null);

    let result: DevicePermissionResult;
    if (mode === 'screen') {
      result = await requestScreenShare();
    } else {
      result = await requestCameraAndMic({
        video: mode !== 'audio-only' ? { deviceId: selectedCamera || undefined } : false,
        audio: { deviceId: selectedMic || undefined },
      });
    }

    if (result.granted && result.stream) {
      setStatus('granted');
      setTestStream(result.stream);
      const devList = await enumerateDevices();
      setDevices(devList);
      onGranted(result.stream, result.devices || []);
    } else {
      setStatus('error');
      setError(result.error || 'AbortError');
      onDenied?.(result.error || 'AbortError');
    }
  }, [mode, selectedCamera, selectedMic, onGranted, onDenied]);

  useEffect(() => {
    // Load device list without requesting permission
    enumerateDevices().then((devList) => {
      if (devList.cameras.length > 0 || devList.microphones.length > 0) {
        setDevices(devList);
      }
    }).catch(() => null);
  }, []);

  useEffect(() => {
    return () => {
      testStream?.getTracks().forEach((t) => t.stop());
    };
  }, [testStream]);

  const errorInfo = error ? PERMISSION_ERRORS[error] : null;
  const fixSteps = error ? getBrowserFixInstructions(browser, error) : [];

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 max-w-md">
      <h3 className="text-white font-bold text-lg mb-2">
        {mode === 'screen' ? 'Share Your Screen' : mode === 'audio-only' ? 'Audio Access' : 'Camera & Microphone'}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        {mode === 'camera-mic' && 'Allow access to join the live session with video and audio.'}
        {mode === 'audio-only' && 'Allow microphone access for audio-only participation.'}
        {mode === 'screen' && 'Share your screen with the live session.'}
      </p>

      {/* Device selectors (when devices are known) */}
      {devices && mode !== 'screen' && status === 'idle' && (
        <div className="space-y-3 mb-4">
          {devices.cameras.length > 0 && mode !== 'audio-only' && (
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Camera</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {devices.cameras.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {devices.microphones.length > 0 && (
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Microphone</label>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {devices.microphones.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Mic ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Status */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.button
            key="request"
            onClick={requestAccess}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.862v6.276a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
            Allow {mode === 'screen' ? 'Screen Share' : mode === 'audio-only' ? 'Microphone' : 'Camera & Mic'}
          </motion.button>
        )}

        {status === 'requesting' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 py-3"
          >
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-300">Waiting for permission...</span>
          </motion.div>
        )}

        {status === 'granted' && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 py-3 text-green-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="font-semibold">Access granted! Joining session...</span>
          </motion.div>
        )}

        {status === 'error' && errorInfo && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h4 className="text-red-400 font-bold mb-1">{errorInfo.title}</h4>
              <p className="text-gray-400 text-sm mb-3">{errorInfo.description}</p>
              <div className="space-y-1">
                {fixSteps.map((step, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              {browser !== 'unknown' && (
                <p className="text-gray-500 text-xs mt-2">
                  Detected: {browser} on {os}
                </p>
              )}
            </div>
            <button
              onClick={() => { setStatus('idle'); setError(null); }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
