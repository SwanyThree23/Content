'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { SocialShareBar } from '@/components/ui/SocialShareBar';
import { useAuthStore } from '@/lib/store';
import type { VideoPost } from '@/lib/types';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function VideoCard({ post }: { post: VideoPost }) {
  const [showShare, setShowShare] = useState(false);

  return (
    <motion.div
      layout
      className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-500 transition-colors"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-800 relative">
        {post.thumbnail_url ? (
          <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🎬</div>
        )}
        {post.duration_seconds && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(post.duration_seconds)}
          </div>
        )}
        {post.is_paywalled && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
            🔒 ${(post.paywall_price_cents / 100).toFixed(2)}
          </div>
        )}
        {post.ai_generated && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded">
            AI
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold mb-1 line-clamp-2">{post.title}</h3>
        {post.description && (
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.description}</p>
        )}

        <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
          <span>👁 {post.view_count.toLocaleString()}</span>
          <span>❤️ {post.like_count}</span>
          <span className={`capitalize px-2 py-0.5 rounded-full ${
            post.status === 'published' ? 'bg-green-500/20 text-green-400' :
            post.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {post.status}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowShare((v) => !v)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Share
          </button>
          {post.status === 'draft' && (
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
              Edit
            </button>
          )}
        </div>

        {showShare && (
          <div className="mt-3">
            <SocialShareBar
              resourceType="video_post"
              resourceId={post.id}
              title={post.title}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function VideoPostsPage() {
  const { token, user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'paywalled'>('all');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['video-posts', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/video-posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return (data.posts || []) as VideoPost[];
    },
    enabled: !!token && !!user,
  });

  const filtered = posts?.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'paywalled') return p.is_paywalled;
    return p.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Video Posts</h1>
            <p className="text-gray-400 text-sm mt-1">Short clips (max 10 min) — share directly to social</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
            + New Post
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'draft', 'published', 'paywalled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-800" />
                <div className="p-4">
                  <div className="h-4 bg-gray-800 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <VideoCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-white text-xl font-semibold mb-2">No video posts yet</h3>
            <p className="text-gray-400">Create your first short video post to share across platforms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
