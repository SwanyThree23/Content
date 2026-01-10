import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Radio, Play, Square } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import api from '../lib/api';

export function Streaming() {
  const [isLive, setIsLive] = useState(false);

  const startStream = useMutation({
    mutationFn: async () => api.post('/streaming/vdoninja/create-room', {
      roomId: `room-${Date.now()}`,
      streamId: `stream-${Date.now()}`
    }),
    onSuccess: (data) => {
      window.open(data.data.room.hostUrl, '_blank');
      setIsLive(true);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Streaming</h1>
        <Button
          variant={isLive ? 'danger' : 'primary'}
          icon={isLive ? <Square size={20} /> : <Play size={20} />}
          onClick={() => isLive ? setIsLive(false) : startStream.mutate()}
        >
          {isLive ? 'Stop Stream' : 'Start Stream'}
        </Button>
      </div>

      {isLive && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Radio className="text-red-600 animate-pulse" />
            <span className="text-lg font-semibold">You're Live!</span>
          </div>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-white">Stream Preview</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold mb-2">VDO.Ninja</h3>
          <p className="text-sm text-gray-600 mb-4">Multi-guest video streaming</p>
          <Button size="sm">Configure</Button>
        </Card>
        <Card>
          <h3 className="font-semibold mb-2">Prism Live</h3>
          <p className="text-sm text-gray-600 mb-4">Multi-platform streaming</p>
          <Button size="sm">Configure</Button>
        </Card>
        <Card>
          <h3 className="font-semibold mb-2">EvMux</h3>
          <p className="text-sm text-gray-600 mb-4">Stream distribution</p>
          <Button size="sm">Configure</Button>
        </Card>
      </div>
    </div>
  );
}
