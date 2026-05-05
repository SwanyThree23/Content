'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveSessionStore } from '@/lib/store';
import type { StreamAlert } from '@/lib/types';

const ALERT_COLORS: Record<string, string> = {
  donation: 'from-yellow-600 to-orange-600',
  payment: 'from-green-600 to-emerald-600',
  follower: 'from-blue-600 to-indigo-600',
  subscriber: 'from-purple-600 to-violet-600',
  message: 'from-gray-700 to-gray-600',
};

const ALERT_ICONS: Record<string, string> = {
  donation: '☕',
  payment: '💸',
  follower: '👤',
  subscriber: '⭐',
  message: '💬',
};

function AlertItem({ alert, onDismiss }: { alert: StreamAlert; onDismiss: () => void }) {
  const gradient = ALERT_COLORS[alert.alert_type] || ALERT_COLORS.message;
  const icon = ALERT_ICONS[alert.alert_type] || '🔔';

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`bg-gradient-to-r ${gradient} rounded-xl p-4 shadow-2xl border border-white/10 min-w-64 max-w-80 cursor-pointer`}
      onClick={onDismiss}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-sm truncate">
              {alert.from_name || 'Anonymous'}
            </span>
            {alert.amount_cents && (
              <span className="text-yellow-300 font-bold text-sm">
                ${(alert.amount_cents / 100).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-white/80 text-xs capitalize">{alert.alert_type}</p>
          {alert.message && (
            <p className="text-white/70 text-xs mt-1 line-clamp-2">{alert.message}</p>
          )}
        </div>
        <button className="text-white/50 hover:text-white/90 flex-shrink-0 transition-colors">×</button>
      </div>

      {/* Animated progress bar */}
      <motion.div
        className="h-0.5 bg-white/30 rounded-full mt-3 overflow-hidden"
        initial={false}
      >
        <motion.div
          className="h-full bg-white/60 rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 8, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  );
}

interface StreamAlertsProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  maxVisible?: number;
}

export function StreamAlerts({ position = 'bottom-right', maxVisible = 3 }: StreamAlertsProps) {
  const { alerts, dismissAlert } = useLiveSessionStore();
  const visible = alerts.slice(-maxVisible);

  const positionClasses: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-3 pointer-events-none`}>
      <AnimatePresence mode="popLayout">
        {visible.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <AlertItem alert={alert} onDismiss={() => dismissAlert(alert.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
