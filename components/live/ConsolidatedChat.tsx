'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveSessionStore } from '@/lib/store';
import type { ChatMessage, ChatPlatform } from '@/lib/types';

const PLATFORM_COLORS: Record<ChatPlatform, string> = {
  youtube: 'text-red-400',
  twitch: 'text-purple-400',
  facebook: 'text-blue-400',
  tiktok: 'text-pink-400',
  instagram: 'text-orange-400',
  direct: 'text-green-400',
};

const PLATFORM_LABELS: Record<ChatPlatform, string> = {
  youtube: 'YT',
  twitch: 'TW',
  facebook: 'FB',
  tiktok: 'TK',
  instagram: 'IG',
  direct: 'DM',
};

function ChatBubble({ message }: { message: ChatMessage }) {
  const platformColor = PLATFORM_COLORS[message.platform];
  const platformLabel = PLATFORM_LABELS[message.platform];
  const isDonation = message.message_type === 'donation' || message.message_type === 'superchat';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`py-1.5 px-2 rounded-lg ${
        isDonation ? 'bg-yellow-500/10 border border-yellow-500/30' : ''
      } ${message.is_pinned ? 'bg-blue-500/10 border border-blue-500/30' : ''}`}
    >
      <div className="flex items-start gap-1.5">
        <span className={`text-xs font-bold ${platformColor} flex-shrink-0 mt-0.5`}>
          [{platformLabel}]
        </span>
        {message.sender_avatar_url && (
          <img
            src={message.sender_avatar_url}
            alt=""
            className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
          />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-blue-300 font-semibold text-xs">
            {message.sender_name || 'Anonymous'}
          </span>
          {isDonation && message.amount_cents && (
            <span className="ml-1 text-yellow-400 text-xs font-bold">
              ${(message.amount_cents / 100).toFixed(2)}
            </span>
          )}
          <span className="text-gray-300 text-sm ml-1 break-words">{message.message}</span>
        </div>
      </div>
    </motion.div>
  );
}

interface ConsolidatedChatProps {
  className?: string;
  maxMessages?: number;
}

export function ConsolidatedChat({ className = '', maxMessages = 100 }: ConsolidatedChatProps) {
  const { chatMessages, session } = useLiveSessionStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<ChatPlatform | 'all'>('all');

  const filtered = chatMessages
    .filter((m) => filter === 'all' || m.platform === filter)
    .slice(-maxMessages);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const platforms: (ChatPlatform | 'all')[] = ['all', 'youtube', 'twitch', 'facebook', 'tiktok', 'instagram', 'direct'];

  return (
    <div className={`flex flex-col bg-gray-900 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-white font-semibold text-sm">Live Chat</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-400 text-xs">{chatMessages.length} msgs</span>
        </div>
      </div>

      {/* Platform filter pills */}
      <div className="flex gap-1 px-2 py-1.5 border-b border-gray-700 overflow-x-auto">
        {platforms.map((p) => {
          const count = p === 'all'
            ? chatMessages.length
            : chatMessages.filter((m) => m.platform === p).length;
          if (count === 0 && p !== 'all') return null;
          return (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {p === 'all' ? 'All' : PLATFORM_LABELS[p as ChatPlatform]} ({count})
            </button>
          );
        })}
      </div>

      {/* Chat messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-1 min-h-0"
        style={{ maxHeight: '400px' }}
      >
        <AnimatePresence initial={false}>
          {filtered.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">
            No messages yet. Chat will appear here from all connected platforms.
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
          }}
          className="mx-2 mb-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
        >
          ↓ New messages
        </button>
      )}
    </div>
  );
}
