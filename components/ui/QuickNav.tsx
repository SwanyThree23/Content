'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/studio', icon: '🎭', label: 'Studio' },
  { href: '/studio/live-studio', icon: '📡', label: 'Live Studio', accent: true },
  { href: '/studio/video-posts', icon: '🎬', label: 'Video Posts' },
  { href: '/studio/professional-broadcast', icon: '📺', label: 'Broadcast' },
  { href: '/studio/live-recording', icon: '🎥', label: 'VDO Record' },
  { href: '/studio/settings', icon: '⚙️', label: 'Settings' },
  { href: 'https://console.evmux.com/editor/3491/244617', icon: '🎛️', label: 'evmux', external: true },
  { href: 'https://console.evmux.com/guest/9ql-0vvq-hsm', icon: '🔗', label: 'Guest', external: true },
];

export function QuickNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger button — bottom-left corner */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-2xl bg-gray-800 border border-gray-600 hover:border-blue-500 flex items-center justify-center shadow-2xl transition-all hover:scale-110"
        style={isOpen ? { backgroundColor: '#068deb', borderColor: '#068deb' } : {}}
        title="Quick Nav"
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="text-xl"
        >
          {isOpen ? '✕' : '☰'}
        </motion.span>
      </button>

      {/* Nav panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-20 left-6 z-50 bg-gray-900 border border-gray-700 rounded-2xl p-3 shadow-2xl w-52"
          >
            <p className="text-gray-500 text-xs font-semibold px-2 mb-2 uppercase tracking-wider">Navigation</p>
            <div className="space-y-0.5">
              {NAV_ITEMS.map(({ href, icon, label, accent, external }) => (
                <Link
                  key={href}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    accent
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  style={accent ? { backgroundColor: '#068deb' } : {}}
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                  {external && <span className="text-gray-500 text-xs ml-auto">↗</span>}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
