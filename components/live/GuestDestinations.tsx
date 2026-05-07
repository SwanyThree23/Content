'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';

type DestinationType = 'youtube' | 'twitch' | 'facebook' | 'custom_rtmp';

const destinationSchema = z.object({
  guest_name: z.string().min(1, 'Name required').max(100),
  destination_type: z.enum(['youtube', 'twitch', 'facebook', 'custom_rtmp']),
  stream_key: z.string().optional(),
  rtmp_url: z.string().url().optional().or(z.literal('')),
});

type DestinationForm = z.infer<typeof destinationSchema>;

const DESTINATION_CONFIGS: Record<DestinationType, { label: string; icon: string; color: string; rtmpUrl: string; keyPlaceholder: string }> = {
  youtube: {
    label: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    keyPlaceholder: 'xxxx-xxxx-xxxx-xxxx-xxxx',
  },
  twitch: {
    label: 'Twitch',
    icon: '🎮',
    color: '#9146FF',
    rtmpUrl: 'rtmp://live.twitch.tv/app',
    keyPlaceholder: 'live_xxxxxxxxx',
  },
  facebook: {
    label: 'Facebook',
    icon: '👥',
    color: '#1877F2',
    rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    keyPlaceholder: 'FB-xxxxxxxxx',
  },
  custom_rtmp: {
    label: 'Custom RTMP',
    icon: '📡',
    color: '#6B7280',
    rtmpUrl: '',
    keyPlaceholder: 'your-stream-key',
  },
};

interface GuestDestinationsProps {
  sessionId: string;
  onClose?: () => void;
}

export function GuestDestinations({ sessionId, onClose }: GuestDestinationsProps) {
  const { token } = useAuthStore();
  const [result, setResult] = useState<null | { instructions: string[]; guest_url: string }>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DestinationForm>({
    resolver: zodResolver(destinationSchema),
    defaultValues: { destination_type: 'youtube' },
  });

  const destType = watch('destination_type') as DestinationType;
  const config = DESTINATION_CONFIGS[destType];

  const onSubmit = async (data: DestinationForm) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/streaming/guest-destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, session_id: sessionId }),
      });
      const resp = await res.json();
      if (resp.success) {
        setResult({ instructions: resp.instructions, guest_url: resp.guest_url });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold">Guest Destinations</h3>
          <p className="text-gray-400 text-xs mt-0.5">Let guests stream to their own channels from this session</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">×</button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <p className="text-green-400 font-semibold text-sm mb-2">Guest destination configured!</p>
              <div className="space-y-1.5">
                {result.instructions.map((step, i) => (
                  <p key={i} className="text-gray-300 text-xs">{step}</p>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 flex items-center gap-2">
              <span className="text-gray-400 text-xs">Guest URL:</span>
              <a
                href={result.guest_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-xs hover:underline truncate"
              >
                {result.guest_url}
              </a>
            </div>
            <button
              onClick={() => setResult(null)}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors"
            >
              Add Another Guest
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Guest name */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Guest Name</label>
              <input
                {...register('guest_name')}
                placeholder="e.g. Jane Smith"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
              {errors.guest_name && (
                <p className="text-red-400 text-xs mt-1">{errors.guest_name.message}</p>
              )}
            </div>

            {/* Destination platform */}
            <div>
              <label className="text-gray-400 text-xs mb-2 block">Their Streaming Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(DESTINATION_CONFIGS) as DestinationType[]).map((type) => {
                  const cfg = DESTINATION_CONFIGS[type];
                  const isActive = destType === type;
                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        isActive ? 'border-transparent' : 'border-gray-700'
                      }`}
                      style={isActive ? { backgroundColor: cfg.color + '20', borderColor: cfg.color } : {}}
                    >
                      <input
                        type="radio"
                        value={type}
                        {...register('destination_type')}
                        className="sr-only"
                      />
                      <span className="text-lg">{cfg.icon}</span>
                      <span className="text-white text-sm font-medium">{cfg.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Stream key */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">
                {destType === 'custom_rtmp' ? 'RTMP URL' : `${config.label} Stream Key`}
              </label>
              <input
                {...register(destType === 'custom_rtmp' ? 'rtmp_url' : 'stream_key')}
                placeholder={destType === 'custom_rtmp' ? 'rtmp://your-server.com/live' : config.keyPlaceholder}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-blue-500 focus:outline-none"
              />
              {destType !== 'custom_rtmp' && (
                <p className="text-gray-500 text-xs mt-1">RTMP: {config.rtmpUrl}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ backgroundColor: config.color }}
            >
              {isLoading ? 'Configuring...' : `Connect ${config.label} Destination`}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
