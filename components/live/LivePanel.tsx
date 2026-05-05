'use client';

import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveSessionStore } from '@/lib/store';
import type { LiveSessionGuest, PanelType } from '@/lib/types';

// Icons (inline SVG for zero extra deps)
function MicIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
    </svg>
  );
}

function MaximizeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
    </svg>
  );
}

const STATUS_COLORS: Record<string, string> = {
  connected: 'bg-green-500',
  connecting: 'bg-yellow-500',
  disconnected: 'bg-gray-500',
  error: 'bg-red-500',
};

interface LivePanelProps {
  guest: LiveSessionGuest;
  streamRef?: React.RefObject<HTMLVideoElement>;
}

export function LivePanel({ guest, streamRef }: LivePanelProps) {
  const { expandPanel, featurePanel, updateGuest, expandedPanel } = useLiveSessionStore();
  const isExpanded = expandedPanel === guest.panel_slot;

  const handleExpand = useCallback(() => {
    expandPanel(isExpanded ? null : guest.panel_slot);
  }, [expandPanel, guest.panel_slot, isExpanded]);

  const handleFeature = useCallback(() => {
    featurePanel(guest.panel_slot);
  }, [featurePanel, guest.panel_slot]);

  const handleMuteToggle = useCallback(() => {
    updateGuest(guest.panel_slot, { is_muted: !guest.is_muted });
  }, [updateGuest, guest.panel_slot, guest.is_muted]);

  return (
    <motion.div
      layout
      className={`relative bg-gray-900 rounded-lg overflow-hidden border-2 ${
        guest.is_featured ? 'border-blue-500' : 'border-gray-700'
      } ${isExpanded ? 'col-span-2 row-span-2' : ''}`}
      animate={{ scale: isExpanded ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Video or Audio-only indicator */}
      {guest.panel_type === 'audio' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2">
              <UserIcon />
            </div>
            <span className="text-white text-sm font-medium">
              {guest.guest_name || `Guest ${guest.panel_slot}`}
            </span>
          </div>
          {/* Audio wave animation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-blue-400 rounded-full"
                animate={{ height: [4, 16, 4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      ) : (
        <video
          ref={streamRef}
          autoPlay
          muted={guest.panel_slot === 1}   // mute self
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* Connection status dot */}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[guest.connection_status] || 'bg-gray-500'}`} />
        {guest.is_featured && (
          <span className="text-xs bg-blue-500 text-white px-1 rounded">LIVE</span>
        )}
      </div>

      {/* Guest name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate">
            {guest.guest_name || `Guest ${guest.panel_slot}`}
          </span>
          <div className="flex gap-1">
            {/* Mute button */}
            <button
              onClick={handleMuteToggle}
              className={`p-1 rounded transition-colors ${
                guest.is_muted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={guest.is_muted ? 'Unmute' : 'Mute'}
            >
              <MicIcon muted={guest.is_muted} />
            </button>
            {/* Bigo-style expand button */}
            <button
              onClick={handleExpand}
              className="p-1 rounded bg-white/20 text-white hover:bg-white/30 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <MaximizeIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Double-click to feature */}
      <div
        className="absolute inset-0 cursor-pointer"
        onDoubleClick={handleFeature}
        style={{ pointerEvents: 'none' }}
      />
    </motion.div>
  );
}
