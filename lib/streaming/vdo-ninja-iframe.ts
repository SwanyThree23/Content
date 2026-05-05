// VDO.ninja iFrame API integration
// Supports: room control, WHIP/WHEP, Meshcast.io CDN, room transfers

export interface VdoNinjaIframeOptions {
  containerId: string;
  roomId: string;
  streamId?: string;
  role: 'host' | 'guest' | 'director' | 'scene';
  resolution?: '360p' | '720p' | '1080p' | '4k';
  audioOnly?: boolean;
  meshcast?: boolean;
  record?: boolean;
  autostart?: boolean;
  label?: string;
  password?: string;
  codec?: 'vp8' | 'vp9' | 'h264' | 'av1';
}

export type VdoNinjaAction =
  | 'mute'
  | 'unmute'
  | 'hideVideo'
  | 'showVideo'
  | 'disconnect'
  | 'changeRoom'
  | 'getStats'
  | 'startRecording'
  | 'stopRecording'
  | 'screenshare'
  | 'hangup';

export interface VdoNinjaIframeEvent {
  action: string;
  value?: unknown;
  UUID?: string;
  streamId?: string;
}

const VDO_NINJA_BASE = 'https://vdo.ninja';
const MESHCAST_BASE = 'wss://meshcast.io';

export class VdoNinjaIframeController {
  private iframe: HTMLIFrameElement | null = null;
  private containerId: string;
  private eventListeners: Map<string, ((event: VdoNinjaIframeEvent) => void)[]> = new Map();

  constructor(containerId: string) {
    this.containerId = containerId;
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  private handleMessage(event: MessageEvent) {
    if (event.origin !== VDO_NINJA_BASE) return;
    const data = event.data as VdoNinjaIframeEvent;
    if (!data?.action) return;

    const listeners = this.eventListeners.get(data.action) || [];
    listeners.forEach((listener) => listener(data));

    const allListeners = this.eventListeners.get('*') || [];
    allListeners.forEach((listener) => listener(data));
  }

  on(action: string, handler: (event: VdoNinjaIframeEvent) => void) {
    const existing = this.eventListeners.get(action) || [];
    this.eventListeners.set(action, [...existing, handler]);
    return this;
  }

  off(action: string, handler: (event: VdoNinjaIframeEvent) => void) {
    const existing = this.eventListeners.get(action) || [];
    this.eventListeners.set(
      action,
      existing.filter((h) => h !== handler)
    );
    return this;
  }

  private sendCommand(action: VdoNinjaAction, value?: unknown) {
    if (!this.iframe?.contentWindow) return;
    this.iframe.contentWindow.postMessage({ action, value }, VDO_NINJA_BASE);
  }

  mount(options: VdoNinjaIframeOptions) {
    const container = document.getElementById(this.containerId);
    if (!container) throw new Error(`Container #${this.containerId} not found`);

    const url = this.buildUrl(options);

    this.iframe = document.createElement('iframe');
    this.iframe.src = url;
    this.iframe.allow = 'camera;microphone;fullscreen;picture-in-picture;display-capture;autoplay;';
    this.iframe.style.cssText = 'width:100%;height:100%;border:none;background:#000;';
    this.iframe.setAttribute('allowfullscreen', '');
    this.iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');

    container.appendChild(this.iframe);
    return this;
  }

  unmount() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleMessage.bind(this));
    }
  }

  buildUrl(options: VdoNinjaIframeOptions): string {
    const params = new URLSearchParams();

    if (options.role === 'guest') {
      params.set('push', options.streamId || options.roomId);
      params.set('room', options.roomId);
    } else if (options.role === 'host') {
      params.set('room', options.roomId);
      params.set('director', '1');
    } else if (options.role === 'scene') {
      params.set('scene', '1');
      params.set('room', options.roomId);
    } else {
      params.set('view', options.streamId || options.roomId);
    }

    if (options.audioOnly) params.set('audioonly', '1');
    if (options.meshcast) params.set('meshcast', '1');
    if (options.record) params.set('record', '1');
    if (options.autostart !== false) params.set('autostart', '1');
    if (options.label) params.set('label', options.label);
    if (options.password) params.set('password', options.password);
    if (options.codec) params.set('codec', options.codec);

    const resMap: Record<string, string> = {
      '360p': '360',
      '720p': '720',
      '1080p': '1080',
      '4k': '4k',
    };
    if (options.resolution) params.set('quality', resMap[options.resolution] || '720');

    // Enable iFrame API events
    params.set('api', '1');

    return `${VDO_NINJA_BASE}/?${params.toString()}`;
  }

  // ---- Actions ----
  mute() { this.sendCommand('mute'); }
  unmute() { this.sendCommand('unmute'); }
  hideVideo() { this.sendCommand('hideVideo'); }
  showVideo() { this.sendCommand('showVideo'); }
  startRecording() { this.sendCommand('startRecording'); }
  stopRecording() { this.sendCommand('stopRecording'); }
  screenshare() { this.sendCommand('screenshare'); }
  hangup() { this.sendCommand('hangup'); }
  getStats() { this.sendCommand('getStats'); }

  changeRoom(newRoomId: string) {
    this.sendCommand('changeRoom', newRoomId);
  }

  disconnect(streamId?: string) {
    this.sendCommand('disconnect', streamId);
  }
}

// ============================================================
// WHIP/WHEP endpoints (VDO.ninja WebRTC ingest/egress)
// ============================================================
export function getWhipUrl(roomId: string, streamId: string): string {
  return `${VDO_NINJA_BASE}/whip?room=${roomId}&streamID=${streamId}`;
}

export function getWhepUrl(streamId: string): string {
  return `${VDO_NINJA_BASE}/whep?view=${streamId}`;
}

// ============================================================
// Meshcast.io CDN URLs
// ============================================================
export function getMeshcastUrl(roomId: string): string {
  return `https://meshcast.io/?room=${roomId}`;
}

export function getMeshcastEmbedUrl(roomId: string): string {
  return `https://iframe.meshcast.io/?room=${roomId}&autoplay=1`;
}

// ============================================================
// Room transfer helper (move guest between rooms)
// ============================================================
export function buildRoomTransferUrl(
  fromRoom: string,
  toRoom: string,
  streamId: string
): string {
  return `${VDO_NINJA_BASE}/?push=${streamId}&room=${toRoom}&from=${fromRoom}`;
}

// ============================================================
// Multi-room scene URL builder
// ============================================================
export function buildSceneUrl(
  roomId: string,
  streamIds: string[],
  options: { layout?: string; label?: boolean } = {}
): string {
  const params = new URLSearchParams({
    scene: '1',
    room: roomId,
    api: '1',
  });
  if (options.layout) params.set('layout', options.layout);
  if (options.label) params.set('label', '1');
  streamIds.forEach((id) => params.append('view', id));
  return `${VDO_NINJA_BASE}/?${params.toString()}`;
}
