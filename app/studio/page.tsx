'use client';

import { useState, useEffect } from 'react';
import { Film, Plus, Play, Upload, TrendingUp } from 'lucide-react';

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

export default function StudioPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadSeries();
  }, []);

  useEffect(() => {
    if (selectedSeries) {
      loadEpisodes(selectedSeries.id);
    }
  }, [selectedSeries]);

  async function loadSeries() {
    try {
      const response = await fetch('/api/series', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setSeries(data.series || []);
      if (data.series?.length > 0) {
        setSelectedSeries(data.series[0]);
      }
    } catch (error) {
      console.error('Failed to load series:', error);
    }
  }

  async function loadEpisodes(seriesId: string) {
    try {
      const response = await fetch(`/api/series/${seriesId}/episodes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error('Failed to load episodes:', error);
    }
  }

  async function generateEpisode() {
    if (!selectedSeries) return;

    setIsGenerating(true);
    try {
      const nextEpisodeNumber = (episodes[0]?.episode_number || 0) + 1;

      const response = await fetch('/api/episodes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          series_id: selectedSeries.id,
          episode_number: nextEpisodeNumber,
          target_duration: 3,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Episode ${nextEpisodeNumber} generated successfully!`);
        loadEpisodes(selectedSeries.id);
      } else {
        alert('Failed to generate episode: ' + data.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate episode');
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateVideos(episodeId: string) {
    try {
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ episode_id: episodeId }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Video generation started! This may take 20-30 minutes.');
      }
    } catch (error) {
      console.error('Video generation error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-8 h-8 text-purple-500" />
              <h1 className="text-2xl font-bold">AI Soap Opera Studio</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition">
                <Plus className="w-5 h-5 inline mr-2" />
                New Series
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Series List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Your Series</h2>
              <div className="space-y-3">
                {series.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeries(s)}
                    className={`w-full text-left p-4 rounded-lg transition ${
                      selectedSeries?.id === s.id
                        ? 'bg-purple-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {s.total_episodes} episodes
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {s.total_views.toLocaleString()} views
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            {selectedSeries && (
              <div className="mt-6 bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Episodes</span>
                    <span className="font-bold">{selectedSeries.total_episodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Views</span>
                    <span className="font-bold">
                      {selectedSeries.total_views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="px-2 py-1 rounded bg-green-600 text-xs">
                      {selectedSeries.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content - Episodes */}
          <div className="lg:col-span-2">
            {selectedSeries && (
              <>
                <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedSeries.title}</h2>
                      <p className="text-gray-400 mt-1">{selectedSeries.description}</p>
                    </div>
                    <button
                      onClick={generateEpisode}
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {isGenerating ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 inline mr-2" />
                          Generate Episode
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Episodes List */}
                <div className="space-y-4">
                  {episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 hover:border-purple-500 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-purple-600 text-sm font-semibold">
                              Episode {episode.episode_number}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                episode.status === 'published'
                                  ? 'bg-green-600'
                                  : episode.status === 'processing'
                                  ? 'bg-yellow-600'
                                  : 'bg-gray-600'
                              }`}
                            >
                              {episode.status}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold mb-2">{episode.title}</h3>
                          <p className="text-gray-400 text-sm">{episode.synopsis}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {episode.status === 'draft' && (
                            <button
                              onClick={() => generateVideos(episode.id)}
                              className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
                              title="Generate Videos"
                            >
                              <Play className="w-5 h-5" />
                            </button>
                          )}
                          {episode.status === 'ready' && (
                            <button
                              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                              title="Upload to YouTube"
                            >
                              <Upload className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {episodes.length === 0 && (
                  <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                    <Film className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No episodes yet</h3>
                    <p className="text-gray-400 mb-6">
                      Generate your first episode to get started
                    </p>
                    <button
                      onClick={generateEpisode}
                      className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
                    >
                      Generate First Episode
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
