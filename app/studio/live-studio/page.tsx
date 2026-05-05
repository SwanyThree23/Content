'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelGrid } from '@/components/live/PanelGrid';
import { StreamAlerts } from '@/components/live/StreamAlerts';
import { ConsolidatedChat } from '@/components/live/ConsolidatedChat';
import { DevicePermissions } from '@/components/live/DevicePermissions';
import { DirectPaymentModal } from '@/components/payments/DirectPaymentModal';
import { useLiveSessionStore } from '@/lib/store';
import { BMC_OVERLAY_URL } from '@/lib/streaming/buy-me-coffee';

type ViewMode = 'setup' | 'live' | 'ended';

export default function LiveStudioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('setup');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [sessionType, setSessionType] = useState<'video' | 'audio'>('video');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBmcOverlay, setShowBmcOverlay] = useState(false);

  const {
    session,
    guests,
    viewerCount,
    isBroadcasting,
    isRecording,
    setBroadcasting,
    setRecording,
    paymentMethods,
  } = useLiveSessionStore();

  const handlePermissionsGranted = useCallback((stream: MediaStream) => {
    setLocalStream(stream);
    setPermissionsGranted(true);
  }, []);

  const handleGoLive = useCallback(() => {
    setViewMode('live');
    setBroadcasting(true);
  }, [setBroadcasting]);

  const handleEndSession = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop());
    setBroadcasting(false);
    setRecording(false);
    setViewMode('ended');
  }, [localStream, setBroadcasting, setRecording]);

  // ---- SETUP SCREEN ----
  if (viewMode === 'setup') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Live Studio</h1>
            <p className="text-gray-400">Domino Entertainment — AI Soap Opera Studio</p>
          </div>

          {/* Session type */}
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 mb-4">
            <h3 className="text-white font-semibold mb-3">Session Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['video', 'audio'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSessionType(type)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sessionType === type
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{type === 'video' ? '🎥' : '🎙️'}</div>
                  <div className="font-medium capitalize">{type}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {type === 'video' ? 'Camera + microphone' : 'Audio only panel'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Device permissions */}
          <div className="mb-4">
            {!permissionsGranted ? (
              <DevicePermissions
                onGranted={handlePermissionsGranted}
                mode={sessionType === 'audio' ? 'audio-only' : 'camera-mic'}
              />
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <p className="text-green-400 font-medium">Devices ready</p>
                  <p className="text-gray-400 text-sm">Camera and microphone are connected</p>
                </div>
              </div>
            )}
          </div>

          {/* VDO.ninja quick links */}
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-4 mb-4">
            <h3 className="text-white font-semibold mb-3">Quick Join Links</h3>
            <div className="space-y-2">
              {[
                { label: 'Room: SwanyThree (Solo view)', url: 'https://vdo.ninja/?view=6EcRB3QE&room=SwanyThree&solo' },
                { label: 'DominoDynasty scene', url: 'https://vdo.ninja/?v=SwanyThree&r=Domino&scn' },
                { label: 'Guest share link', url: 'https://vdo.ninja/?v=xaUagnuH' },
              ].map(({ label, url }) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors group"
                >
                  <span className="text-gray-300 text-sm">{label}</span>
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={handleGoLive}
            disabled={!permissionsGranted}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-3"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            Go Live
          </button>
        </motion.div>
      </div>
    );
  }

  // ---- ENDED SCREEN ----
  if (viewMode === 'ended') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-5xl mb-4">📺</div>
          <h2 className="text-white text-2xl font-bold mb-2">Session Ended</h2>
          <p className="text-gray-400 mb-2">Peak viewers: {viewerCount}</p>
          <p className="text-gray-400 mb-6">Your session has ended. Review analytics or start a new one.</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setViewMode('setup'); setPermissionsGranted(false); }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              New Session
            </button>
            <a
              href="/studio"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors text-center"
            >
              Studio Dashboard
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- LIVE SCREEN ----
  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-bold">LIVE</span>
          </div>
          <span className="text-gray-400 text-sm">{session?.title || 'Domino Entertainment Live'}</span>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            {viewerCount.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* BMC overlay toggle */}
          <button
            onClick={() => setShowBmcOverlay((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showBmcOverlay ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Buy Me a Coffee alerts"
          >
            ☕ Alerts
          </button>

          {/* Direct payment */}
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            💸 Tip Creator
          </button>

          {/* Recording toggle */}
          <button
            onClick={() => setRecording(!isRecording)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isRecording ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isRecording ? '⏹ Stop Rec' : '⏺ Record'}
          </button>

          {/* End session */}
          <button
            onClick={handleEndSession}
            className="bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            End
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Panel grid - main area */}
        <div className="flex-1 min-w-0 p-3">
          <PanelGrid />
        </div>

        {/* Right sidebar - chat */}
        <div className="w-72 flex-shrink-0 border-l border-gray-700 flex flex-col">
          <ConsolidatedChat className="flex-1 rounded-none border-0 border-b border-gray-700" />

          {/* evmux console link */}
          <div className="p-3">
            <a
              href="https://console.evmux.com/editor/3491/244617"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 text-center text-sm text-gray-300 transition-colors mb-2"
            >
              Open evmux Console →
            </a>
            <a
              href="https://console.evmux.com/guest/9ql-0vvq-hsm"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 text-center text-sm text-gray-300 transition-colors"
            >
              Guest Portal →
            </a>
          </div>
        </div>
      </div>

      {/* Stream alerts overlay */}
      <StreamAlerts position="bottom-right" maxVisible={3} />

      {/* BMC iframe overlay (if enabled) */}
      <AnimatePresence>
        {showBmcOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-80 h-48 bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl z-40"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-gray-800">
              <span className="text-yellow-400 text-sm font-medium">☕ Buy Me a Coffee Alerts</span>
              <button
                onClick={() => setShowBmcOverlay(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >×</button>
            </div>
            <iframe
              src={BMC_OVERLAY_URL}
              className="w-full h-full border-0"
              title="Buy Me a Coffee Alerts"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Direct payment modal */}
      <DirectPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        recipientName={session?.title || 'Creator'}
        paymentMethods={paymentMethods}
        sessionId={session?.id}
      />
    </div>
  );
}
