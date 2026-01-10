'use client';

import { useState } from 'react';
import { Video, Users, Link as LinkIcon, Play, Square, Copy, ExternalLink } from 'lucide-react';

interface Actor {
  name: string;
  character: string;
}

interface RecordingRoom {
  id: string;
  roomId: string;
  password: string;
  directorUrl: string;
  viewUrl: string;
  actorUrls: Array<{
    actor: string;
    character: string;
    url: string;
  }>;
}

export default function LiveRecordingPage() {
  const [actors, setActors] = useState<Actor[]>([{ name: '', character: '' }]);
  const [room, setRoom] = useState<RecordingRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState('');
  const [sceneNumber, setSceneNumber] = useState(1);

  const addActor = () => {
    setActors([...actors, { name: '', character: '' }]);
  };

  const updateActor = (index: number, field: 'name' | 'character', value: string) => {
    const updated = [...actors];
    updated[index][field] = value;
    setActors(updated);
  };

  const removeActor = (index: number) => {
    setActors(actors.filter((_, i) => i !== index));
  };

  const createRecordingRoom = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/streaming/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          episode_id: selectedEpisode,
          scene_number: sceneNumber,
          actors: actors.filter(a => a.name && a.character),
          quality: 'high',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRoom(data.session);
      } else {
        alert('Failed to create room: ' + data.error);
      }
    } catch (error) {
      console.error('Create room error:', error);
      alert('Failed to create recording room');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="container mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Video className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold">Live Recording Studio</h1>
        </div>
        <p className="text-gray-400">Record scenes with live actors using VDO.ninja</p>
      </div>

      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Setup Panel */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Setup Recording Session
            </h2>

            {/* Episode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Episode</label>
              <input
                type="text"
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(e.target.value)}
                placeholder="Episode ID"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Scene Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Scene Number</label>
              <input
                type="number"
                value={sceneNumber}
                onChange={(e) => setSceneNumber(parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Actors */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Actors</label>
              <div className="space-y-3">
                {actors.map((actor, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={actor.name}
                      onChange={(e) => updateActor(index, 'name', e.target.value)}
                      placeholder="Actor Name"
                      className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      type="text"
                      value={actor.character}
                      onChange={(e) => updateActor(index, 'character', e.target.value)}
                      placeholder="Character"
                      className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    {actors.length > 1 && (
                      <button
                        onClick={() => removeActor(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addActor}
                className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition w-full"
              >
                + Add Actor
              </button>
            </div>

            {/* Create Room Button */}
            <button
              onClick={createRecordingRoom}
              disabled={isCreating || !selectedEpisode || actors.filter(a => a.name && a.character).length === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating Room...' : 'Create Recording Room'}
            </button>
          </div>

          {/* Room Info Panel */}
          {room && (
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <LinkIcon className="w-6 h-6" />
                Recording Room Created
              </h2>

              {/* Room Info */}
              <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Room ID:</span>
                    <p className="font-mono font-semibold">{room.roomId}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Password:</span>
                    <p className="font-mono font-semibold">{room.password}</p>
                  </div>
                </div>
              </div>

              {/* Director URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-purple-400">
                  Director Control Room
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={room.directorUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(room.directorUrl, 'Director URL')}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <a
                    href={room.directorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* View URL */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-green-400">
                  Monitor View
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={room.viewUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(room.viewUrl, 'View URL')}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <a
                    href={room.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Actor URLs */}
              <div>
                <label className="block text-sm font-medium mb-3 text-blue-400">
                  Actor Stream URLs
                </label>
                <div className="space-y-3">
                  {room.actorUrls.map((actorUrl, index) => (
                    <div key={index} className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{actorUrl.actor}</p>
                          <p className="text-sm text-gray-400">as {actorUrl.character}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={actorUrl.url}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-700 rounded text-xs font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(actorUrl.url, `${actorUrl.actor}'s URL`)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={actorUrl.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                <h3 className="font-semibold mb-2">📋 Recording Instructions</h3>
                <ol className="text-sm space-y-1 text-gray-300">
                  <li>1. Open Director URL to control the recording</li>
                  <li>2. Send each actor their unique URL</li>
                  <li>3. Actors join and enable camera/microphone</li>
                  <li>4. Use Director controls to start recording</li>
                  <li>5. Record the scene</li>
                  <li>6. Stop recording and download video</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        {!room && (
          <div className="mt-8 bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
            <h3 className="text-xl font-bold mb-4">🎥 About Live Recording</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-purple-400">Multi-Camera Setup</h4>
                <p className="text-sm text-gray-400">
                  Each actor gets their own stream URL. All streams are synchronized and can be
                  recorded together.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-400">Director Control</h4>
                <p className="text-sm text-gray-400">
                  Use the Director URL to manage all streams, control recording, and monitor
                  quality in real-time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">Free & Private</h4>
                <p className="text-sm text-gray-400">
                  VDO.ninja is peer-to-peer, completely free, and your streams are private with
                  password protection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
