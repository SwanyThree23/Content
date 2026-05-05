'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

interface Series {
  id: string;
  title: string;
  description: string;
  total_episodes: number;
  total_views: number;
  status: string;
}

interface Episode {
  id: string;
  episode_number: number;
  title: string;
  synopsis: string;
  status: string;
}

function NavItem({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 ${color}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function StudioPage() {
  const { token } = useAuthStore();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: seriesData, refetch: refetchSeries } = useQuery({
    queryKey: ['series'],
    queryFn: async () => {
      const res = await fetch('/api/series', { headers: authHeader });
      const data = await res.json();
      return (data.series || []) as Series[];
    },
    enabled: !!token,
  });

  const series = seriesData || [];
  const selectedSeries = series.find((s) => s.id === selectedSeriesId) || series[0] || null;

  useEffect(() => {
    if (series.length > 0 && !selectedSeriesId) {
      setSelectedSeriesId(series[0].id);
    }
  }, [series, selectedSeriesId]);

  const { data: episodes, refetch: refetchEpisodes } = useQuery({
    queryKey: ['episodes', selectedSeries?.id],
    queryFn: async () => {
      const res = await fetch(`/api/series/${selectedSeries!.id}/episodes`, { headers: authHeader });
      const data = await res.json();
      return (data.episodes || []) as Episode[];
    },
    enabled: !!selectedSeries?.id && !!token,
  });

  const generateEpisode = useCallback(async () => {
    if (!selectedSeries) return;
    setIsGenerating(true);
    try {
      const nextEp = ((episodes?.[0]?.episode_number) || 0) + 1;
      const res = await fetch('/api/episodes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ series_id: selectedSeries.id, episode_number: nextEp, target_duration: 3 }),
      });
      const data = await res.json();
      if (data.success) refetchEpisodes();
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSeries, episodes, authHeader, refetchEpisodes]);

  const generateVideos = useCallback(async (episodeId: string) => {
    await fetch('/api/videos/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ episode_id: episodeId }),
    });
    refetchEpisodes();
  }, [authHeader, refetchEpisodes]);

  const uploadToYoutube = useCallback(async (episodeId: string) => {
    await fetch('/api/youtube/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ episode_id: episodeId }),
    });
    refetchEpisodes();
  }, [authHeader, refetchEpisodes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div>
                <h1 className="text-xl font-bold leading-tight">AI Soap Opera Studio</h1>
                <p className="text-gray-400 text-xs">Domino Entertainment</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 flex-wrap">
              <NavItem href="/studio/live-studio" icon="📡" label="Live Studio" color="bg-red-600 hover:bg-red-700 text-white" />
              <NavItem href="/studio/video-posts" icon="🎬" label="Video Posts" color="bg-purple-600 hover:bg-purple-700 text-white" />
              <NavItem href="/studio/professional-broadcast" icon="📺" label="Pro Broadcast" color="bg-blue-600 hover:bg-blue-700 text-white" />
              <NavItem href="/studio/live-recording" icon="🎥" label="VDO Recording" color="bg-green-600 hover:bg-green-700 text-white" />
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>📚</span> Series
              </h2>
              <div className="space-y-2">
                {series.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => setSelectedSeriesId(s.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedSeries?.id === s.id
                        ? 'bg-purple-600 border border-purple-400'
                        : 'bg-gray-700/60 hover:bg-gray-700 border border-transparent'
                    }`}
                  >
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {s.total_episodes} eps · {s.total_views.toLocaleString()} views
                    </p>
                  </motion.button>
                ))}
                {series.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No series yet</p>
                )}
              </div>
            </div>

            {/* Feature shortcuts */}
            <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700">
              <h3 className="font-semibold mb-3 text-sm text-gray-300">Quick Access</h3>
              <div className="space-y-2">
                {[
                  { href: '/studio/live-studio', icon: '📡', label: 'Go Live Now', desc: '9+ guest panels, direct payments' },
                  { href: '/studio/video-posts', icon: '🎬', label: 'Video Posts', desc: '10 min max, share to all platforms' },
                  { href: '/studio/professional-broadcast', icon: '📺', label: 'Broadcast', desc: 'evmux RTMP to YouTube/Twitch' },
                  { href: 'https://console.evmux.com/editor/3491/244617', icon: '🎛️', label: 'evmux Console', desc: 'External' },
                ].map(({ href, icon, label, desc }) => (
                  <a
                    key={href}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-700/40 hover:bg-gray-700 transition-colors group"
                  >
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2">
            {selectedSeries ? (
              <>
                <motion.div
                  layout
                  className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedSeries.title}</h2>
                      <p className="text-gray-400 text-sm mt-1">{selectedSeries.description}</p>
                    </div>
                    <button
                      onClick={generateEpisode}
                      disabled={isGenerating}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all"
                    >
                      {isGenerating ? '⏳ Generating...' : '✨ Generate Episode'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Episodes', value: selectedSeries.total_episodes },
                      { label: 'Total Views', value: selectedSeries.total_views.toLocaleString() },
                      { label: 'Status', value: selectedSeries.status },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-700/50 rounded-xl p-3">
                        <p className="text-gray-400 text-xs">{label}</p>
                        <p className="text-white font-bold mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Episodes */}
                <div className="space-y-3">
                  {episodes?.map((ep) => (
                    <motion.div
                      key={ep.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-xs font-bold">
                              Ep {ep.episode_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              ep.status === 'published' ? 'bg-green-500/20 text-green-400' :
                              ep.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                              ep.status === 'scripted' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-700 text-gray-400'
                            }`}>
                              {ep.status}
                            </span>
                          </div>
                          <h3 className="font-bold mb-1">{ep.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2">{ep.synopsis}</p>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          {(ep.status === 'scripted' || ep.status === 'draft') && (
                            <button
                              onClick={() => generateVideos(ep.id)}
                              className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                              title="Generate Videos"
                            >🎥</button>
                          )}
                          {ep.status === 'editing' && (
                            <button
                              onClick={() => uploadToYoutube(ep.id)}
                              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                              title="Upload to YouTube"
                            >▶️</button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {(!episodes || episodes.length === 0) && (
                    <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
                      <div className="text-5xl mb-3">🎬</div>
                      <h3 className="text-xl font-semibold mb-2">No episodes yet</h3>
                      <p className="text-gray-400 mb-5">Generate your first AI episode to get started</p>
                      <button onClick={generateEpisode} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-semibold text-sm">
                        Generate First Episode
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎭</div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Domino Entertainment</h2>
                <p className="text-gray-400 mb-6">Create your first series to start generating AI soap opera episodes</p>
                <button className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-semibold">
                  Create First Series
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
