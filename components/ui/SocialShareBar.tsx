'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Platform = 'instagram' | 'facebook' | 'tiktok' | 'snapchat' | 'youtube' | 'twitter' | 'copy_link';

const PLATFORMS: { id: Platform; label: string; color: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: '📸' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', icon: '👥' },
  { id: 'tiktok', label: 'TikTok', color: '#000000', icon: '🎵' },
  { id: 'snapchat', label: 'Snapchat', color: '#FFFC00', icon: '👻' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', icon: '▶️' },
  { id: 'twitter', label: 'Twitter/X', color: '#000000', icon: '🐦' },
  { id: 'copy_link', label: 'Copy Link', color: '#6B7280', icon: '🔗' },
];

interface SocialShareBarProps {
  resourceType: 'live_session' | 'video_post' | 'episode' | 'series';
  resourceId: string;
  title?: string;
  onShare?: (platforms: Platform[]) => void;
}

export function SocialShareBar({ resourceType, resourceId, title, onShare }: SocialShareBarProps) {
  const [selected, setSelected] = useState<Set<Platform>>(new Set());
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<null | 'success' | 'error'>(null);

  const togglePlatform = useCallback((platform: Platform) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  }, []);

  const handleShare = useCallback(async () => {
    if (selected.size === 0) return;

    if (selected.has('copy_link')) {
      const url = `${window.location.origin}/${resourceType}/${resourceId}`;
      await navigator.clipboard.writeText(url).catch(() => null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    const apiPlatforms = Array.from(selected).filter((p) => p !== 'copy_link');
    if (apiPlatforms.length > 0) {
      setIsSharing(true);
      try {
        const res = await fetch('/api/social/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource_type: resourceType, resource_id: resourceId, platforms: apiPlatforms }),
        });
        const data = await res.json();

        if (data.success) {
          setShareResult('success');
          // Open each platform URL
          data.shares?.forEach((share: { share_url: string; platform: string }) => {
            if (share.platform !== 'copy_link' && share.share_url) {
              window.open(share.share_url, '_blank', 'noopener,noreferrer');
            }
          });
          onShare?.(Array.from(selected));
        } else {
          setShareResult('error');
        }
      } catch {
        setShareResult('error');
      } finally {
        setIsSharing(false);
        setTimeout(() => setShareResult(null), 3000);
      }
    }
  }, [selected, resourceType, resourceId, onShare]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
      <h4 className="text-white font-semibold text-sm mb-3">Share to</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {PLATFORMS.map(({ id, label, color, icon }) => {
          const isActive = selected.has(id);
          return (
            <motion.button
              key={id}
              onClick={() => togglePlatform(id)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'text-gray-400 border-gray-600 hover:border-gray-400'
              }`}
              style={isActive ? { backgroundColor: color, borderColor: color } : {}}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          disabled={selected.size === 0 || isSharing}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          {isSharing ? 'Sharing...' : `Share to ${selected.size} platform${selected.size !== 1 ? 's' : ''}`}
        </button>
        {selected.size > 0 && (
          <button
            onClick={() => setSelected(new Set())}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors px-2"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {(shareResult || copied) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-xs mt-2 ${
              shareResult === 'success' || copied ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {copied ? '✓ Link copied!' : shareResult === 'success' ? '✓ Shared successfully!' : '✗ Share failed. Try again.'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
