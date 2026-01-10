'use client';

import { useState } from 'react';
import { Radio, Tv, Play, Settings, Youtube, Twitch, Film } from 'lucide-react';

type WorkflowType = 'vdo_only' | 'evmux_only' | 'hybrid';

export default function ProfessionalBroadcastPage() {
  const [workflowType, setWorkflowType] = useState<WorkflowType>('hybrid');
  const [episodeId, setEpisodeId] = useState('');
  const [actors, setActors] = useState([{ name: '', character: '' }]);
  const [youtubeStreamKey, setYoutubeStreamKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [workflow, setWorkflow] = useState<any>(null);

  const createWorkflow = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/streaming/workflow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          episode_id: episodeId,
          workflow_type: workflowType,
          vdo_config: (workflowType === 'vdo_only' || workflowType === 'hybrid') ? {
            roomId: `Episode_${episodeId}`,
            actors: actors.filter(a => a.name && a.character),
          } : undefined,
          evmux_config: (workflowType === 'evmux_only' || workflowType === 'hybrid') ? {
            rtmpUrl: 'rtmp://rtmp1.us-east-1.evmux.com/live',
            appId: 'app-b6zHr3-35539f7e-1450-4412-9c6e-0372cd9bcbba',
            token: '7db2077153',
          } : undefined,
          youtube_stream_key: youtubeStreamKey || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setWorkflow(data.workflow);
      } else {
        alert('Failed to create workflow: ' + data.error);
      }
    } catch (error) {
      console.error('Create workflow error:', error);
      alert('Failed to create workflow');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="container mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Radio className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold">Professional Broadcast Studio</h1>
        </div>
        <p className="text-gray-400">Complete production workflow: VDO.ninja + evmux + YouTube</p>
      </div>

      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Workflow Selection */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-bold mb-6">Select Production Workflow</h2>

            {/* Workflow Types */}
            <div className="space-y-4 mb-6">
              {/* VDO.ninja Only */}
              <button
                onClick={() => setWorkflowType('vdo_only')}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  workflowType === 'vdo_only'
                    ? 'border-green-500 bg-green-900/30'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Film className="w-6 h-6 text-green-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">VDO.ninja Recording Only</h3>
                    <p className="text-sm text-gray-400">
                      Record live actors via VDO.ninja, download videos, edit and upload manually
                    </p>
                    <div className="mt-2 flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-green-600 rounded">FREE</span>
                      <span className="px-2 py-1 bg-blue-600 rounded">Simple</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* evmux Only */}
              <button
                onClick={() => setWorkflowType('evmux_only')}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  workflowType === 'evmux_only'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Tv className="w-6 h-6 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">evmux Broadcast Only</h3>
                    <p className="text-sm text-gray-400">
                      Professional RTMP streaming with overlays, titles, and multi-platform broadcast
                    </p>
                    <div className="mt-2 flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-600 rounded">Professional</span>
                      <span className="px-2 py-1 bg-purple-600 rounded">Live Streaming</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Hybrid */}
              <button
                onClick={() => setWorkflowType('hybrid')}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  workflowType === 'hybrid'
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Radio className="w-6 h-6 text-purple-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Hybrid Production ⭐ (Recommended)</h3>
                    <p className="text-sm text-gray-400">
                      Record with VDO.ninja, broadcast via evmux with overlays, stream to YouTube/Twitch
                    </p>
                    <div className="mt-2 flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-purple-600 rounded">Complete</span>
                      <span className="px-2 py-1 bg-yellow-600 rounded">Best Quality</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              {/* Episode ID */}
              <div>
                <label className="block text-sm font-medium mb-2">Episode ID</label>
                <input
                  type="text"
                  value={episodeId}
                  onChange={(e) => setEpisodeId(e.target.value)}
                  placeholder="Episode UUID"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* VDO.ninja Config (if applicable) */}
              {(workflowType === 'vdo_only' || workflowType === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Actors</label>
                  <div className="space-y-2">
                    {actors.map((actor, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={actor.name}
                          onChange={(e) => {
                            const updated = [...actors];
                            updated[index].name = e.target.value;
                            setActors(updated);
                          }}
                          placeholder="Actor Name"
                          className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <input
                          type="text"
                          value={actor.character}
                          onChange={(e) => {
                            const updated = [...actors];
                            updated[index].character = e.target.value;
                            setActors(updated);
                          }}
                          placeholder="Character"
                          className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setActors([...actors, { name: '', character: '' }])}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    >
                      + Add Actor
                    </button>
                  </div>
                </div>
              )}

              {/* YouTube Stream Key (optional) */}
              {(workflowType === 'evmux_only' || workflowType === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Youtube className="w-4 h-4 inline mr-2" />
                    YouTube Stream Key (Optional)
                  </label>
                  <input
                    type="text"
                    value={youtubeStreamKey}
                    onChange={(e) => setYoutubeStreamKey(e.target.value)}
                    placeholder="Your YouTube live stream key"
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Add to stream directly to YouTube Live
                  </p>
                </div>
              )}

              {/* Create Button */}
              <button
                onClick={createWorkflow}
                disabled={isCreating || !episodeId}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating Workflow...' : 'Create Production Workflow'}
              </button>
            </div>
          </div>

          {/* Workflow Preview */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-bold mb-6">Workflow Preview</h2>

            {!workflow ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-semibold mb-2">
                    {workflowType === 'vdo_only' && '📹 VDO.ninja Recording'}
                    {workflowType === 'evmux_only' && '📡 evmux Broadcast'}
                    {workflowType === 'hybrid' && '🎬 Hybrid Production'}
                  </h3>
                  <div className="text-sm text-gray-400 space-y-2">
                    {workflowType === 'vdo_only' && (
                      <>
                        <p>✓ Create VDO.ninja recording room</p>
                        <p>✓ Multi-camera actor setup</p>
                        <p>✓ Record and download videos</p>
                        <p>✓ Manual editing and upload</p>
                      </>
                    )}
                    {workflowType === 'evmux_only' && (
                      <>
                        <p>✓ Setup RTMP streaming</p>
                        <p>✓ Add web source overlays</p>
                        <p>✓ Configure multi-platform destinations</p>
                        <p>✓ Live broadcast to YouTube/Twitch</p>
                      </>
                    )}
                    {workflowType === 'hybrid' && (
                      <>
                        <p>✓ Step 1: VDO.ninja recording room</p>
                        <p>✓ Step 2: Record with live actors</p>
                        <p>✓ Step 3: evmux broadcast setup</p>
                        <p>✓ Step 4: Add title overlays & branding</p>
                        <p>✓ Step 5: Stream to YouTube/Twitch</p>
                        <p>✓ Step 6: Auto-publish to channel</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Hybrid workflow gives best results</li>
                    <li>• Use 1080p30 for quality/bandwidth balance</li>
                    <li>• Test your setup before going live</li>
                    <li>• Have backup internet connection</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                  <h3 className="font-semibold text-green-400 mb-2">✓ Workflow Created!</h3>
                  <p className="text-sm text-gray-300">
                    Workflow ID: <span className="font-mono">{workflow.id}</span>
                  </p>
                </div>

                {/* Workflow Steps */}
                <div className="space-y-3">
                  {workflow.steps.map((step: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{step.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-600 rounded text-xs">
                            {step.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Session Links */}
                <div className="space-y-2">
                  {workflow.recordingSessionId && (
                    <a
                      href={`/studio/live-recording?session=${workflow.recordingSessionId}`}
                      className="block px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition text-center font-semibold"
                    >
                      📹 Open VDO.ninja Recording Room
                    </a>
                  )}
                  {workflow.broadcastSessionId && (
                    <a
                      href={`/studio/broadcast?session=${workflow.broadcastSessionId}`}
                      className="block px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-center font-semibold"
                    >
                      📡 Open evmux Broadcast Studio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
          <h3 className="text-xl font-bold mb-4">🎯 Workflow Comparison</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-400">VDO.ninja Only</h4>
              <p className="text-sm text-gray-400 mb-2">Best for simple recordings</p>
              <ul className="text-xs space-y-1 text-gray-500">
                <li>✓ Free peer-to-peer</li>
                <li>✓ Multi-camera support</li>
                <li>✓ No streaming costs</li>
                <li>✗ Manual editing required</li>
                <li>✗ No live streaming</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-400">evmux Only</h4>
              <p className="text-sm text-gray-400 mb-2">Best for live streaming</p>
              <ul className="text-xs space-y-1 text-gray-500">
                <li>✓ Professional overlays</li>
                <li>✓ Multi-platform streaming</li>
                <li>✓ RTMP broadcasting</li>
                <li>✗ Requires video source</li>
                <li>✗ Not for recording</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-purple-400">Hybrid ⭐</h4>
              <p className="text-sm text-gray-400 mb-2">Best overall solution</p>
              <ul className="text-xs space-y-1 text-gray-500">
                <li>✓ Record with VDO.ninja</li>
                <li>✓ Broadcast with evmux</li>
                <li>✓ Professional overlays</li>
                <li>✓ Live streaming</li>
                <li>✓ Complete automation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
