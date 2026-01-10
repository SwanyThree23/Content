// evmux Professional Streaming Platform Integration
// RTMP streaming, web sources, and multi-platform broadcasting

export interface EvmuxConfig {
  apiKey?: string;
  rtmpUrl: string;
  appId: string;
  token: string;
  region?: 'us-east-1' | 'us-west-2' | 'eu-west-1';
}

export interface RTMPStream {
  id: string;
  url: string;
  streamKey: string;
  status: 'idle' | 'connecting' | 'live' | 'offline' | 'error';
  bitrate?: number;
  resolution?: string;
  fps?: number;
  startedAt?: Date;
  viewers?: number;
}

export interface WebSource {
  id: string;
  name: string;
  url: string;
  type: 'html' | 'overlay' | 'title' | 'animation';
  width: number;
  height: number;
  position?: { x: number; y: number };
  zIndex?: number;
  enabled: boolean;
}

export interface BroadcastSession {
  id: string;
  episodeId: string;
  streamId: string;
  rtmpUrl: string;
  streamKey: string;
  webSources: WebSource[];
  destinations: StreamDestination[];
  status: 'setup' | 'live' | 'paused' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
}

export interface StreamDestination {
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom';
  rtmpUrl: string;
  streamKey: string;
  enabled: boolean;
}

/**
 * evmux Configuration
 */
export const EVMUX_CONFIG = {
  baseUrl: 'https://console.evmux.com',
  rtmpEndpoint: 'rtmp://rtmp1.us-east-1.evmux.com/live',
  apiEndpoint: 'https://api.evmux.com/v1',
  webSourceBase: 'https://publicfiles.evmux.com/static/websources',
};

/**
 * Create RTMP stream configuration
 */
export function createRTMPStream(config: EvmuxConfig): RTMPStream {
  const streamKey = `${config.appId}?token=${config.token}`;

  return {
    id: `stream_${Date.now()}`,
    url: config.rtmpUrl,
    streamKey,
    status: 'idle',
    bitrate: 4500,
    resolution: '1920x1080',
    fps: 30,
  };
}

/**
 * Generate complete RTMP URL with stream key
 */
export function getRTMPUrl(stream: RTMPStream): string {
  return `${stream.url}/${stream.streamKey}`;
}

/**
 * Create web source overlay
 */
export function createWebSource(config: {
  name: string;
  url: string;
  type: WebSource['type'];
  width?: number;
  height?: number;
  position?: { x: number; y: number };
}): WebSource {
  return {
    id: `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: config.name,
    url: config.url,
    type: config.type,
    width: config.width || 1920,
    height: config.height || 1080,
    position: config.position || { x: 0, y: 0 },
    zIndex: 10,
    enabled: true,
  };
}

/**
 * Pre-built web source templates
 */
export const WEB_SOURCE_TEMPLATES = {
  soapOperaTitle: (seriesTitle: string, episodeNumber: number): WebSource => ({
    id: `title_${Date.now()}`,
    name: `${seriesTitle} - Episode ${episodeNumber}`,
    url: createTitleOverlayUrl(seriesTitle, episodeNumber),
    type: 'title',
    width: 1920,
    height: 200,
    position: { x: 0, y: 0 },
    zIndex: 20,
    enabled: true,
  }),

  lowerThird: (text: string): WebSource => ({
    id: `lower_${Date.now()}`,
    name: 'Lower Third',
    url: createLowerThirdUrl(text),
    type: 'overlay',
    width: 600,
    height: 100,
    position: { x: 50, y: 880 },
    zIndex: 15,
    enabled: true,
  }),

  brandingLogo: (logoUrl: string): WebSource => ({
    id: `logo_${Date.now()}`,
    name: 'Branding Logo',
    url: logoUrl,
    type: 'overlay',
    width: 200,
    height: 200,
    position: { x: 1670, y: 30 },
    zIndex: 25,
    enabled: true,
  }),

  animatedWater: (): WebSource => ({
    id: `water_${Date.now()}`,
    name: 'Animated Water Effect',
    url: `${EVMUX_CONFIG.webSourceBase}/websource-demo.v7.html`,
    type: 'animation',
    width: 1920,
    height: 1080,
    position: { x: 0, y: 0 },
    zIndex: 5,
    enabled: true,
  }),
};

/**
 * Create HTML title overlay
 */
function createTitleOverlayUrl(title: string, episode: number): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    margin: 0;
    padding: 0;
    background: linear-gradient(to right, rgba(0,0,0,0.8), transparent);
    display: flex;
    align-items: center;
    height: 100vh;
    font-family: 'Roboto', sans-serif;
  }
  .title-container {
    padding: 40px;
    color: #fff;
  }
  .series-title {
    font-size: 80px;
    font-weight: bold;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
    margin: 0;
  }
  .episode-number {
    font-size: 40px;
    color: #068deb;
    margin: 10px 0 0 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }
</style>
</head>
<body>
  <div class="title-container">
    <h1 class="series-title">${title}</h1>
    <p class="episode-number">Episode ${episode}</p>
  </div>
</body>
</html>`;

  return `data:text/html;base64,${Buffer.from(html).toString('base64')}`;
}

/**
 * Create lower third overlay
 */
function createLowerThirdUrl(text: string): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: flex-end;
    height: 100vh;
  }
  .lower-third {
    background: linear-gradient(to right, #068deb, rgba(6, 141, 235, 0.7));
    padding: 15px 30px;
    color: #fff;
    font-family: 'Roboto', sans-serif;
    font-size: 24px;
    font-weight: 500;
    animation: slideIn 0.5s ease-out;
  }
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
</style>
</head>
<body>
  <div class="lower-third">${text}</div>
</body>
</html>`;

  return `data:text/html;base64,${Buffer.from(html).toString('base64')}`;
}

/**
 * Create multi-platform broadcast session
 */
export function createBroadcastSession(config: {
  episodeId: string;
  rtmpConfig: EvmuxConfig;
  destinations?: StreamDestination[];
}): BroadcastSession {
  const stream = createRTMPStream(config.rtmpConfig);

  return {
    id: `broadcast_${Date.now()}`,
    episodeId: config.episodeId,
    streamId: stream.id,
    rtmpUrl: stream.url,
    streamKey: stream.streamKey,
    webSources: [],
    destinations: config.destinations || [],
    status: 'setup',
  };
}

/**
 * Add YouTube as streaming destination
 */
export function addYouTubeDestination(youtubeStreamKey: string): StreamDestination {
  return {
    platform: 'youtube',
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey: youtubeStreamKey,
    enabled: true,
  };
}

/**
 * Add Twitch as streaming destination
 */
export function addTwitchDestination(twitchStreamKey: string): StreamDestination {
  return {
    platform: 'twitch',
    rtmpUrl: 'rtmp://live.twitch.tv/app',
    streamKey: twitchStreamKey,
    enabled: true,
  };
}

/**
 * Generate OBS Studio configuration
 */
export function generateOBSConfig(stream: RTMPStream, webSources: WebSource[]): {
  server: string;
  streamKey: string;
  sources: Array<{ name: string; url: string; type: string }>;
} {
  return {
    server: stream.url,
    streamKey: stream.streamKey,
    sources: webSources.map(source => ({
      name: source.name,
      url: source.url,
      type: 'browser_source',
    })),
  };
}

/**
 * Integrate VDO.ninja with evmux
 */
export function integrateVDONinjaStream(
  vdoNinjaViewUrl: string,
  evmuxConfig: EvmuxConfig
): BroadcastSession {
  const session = createBroadcastSession({
    episodeId: '', // Set by caller
    rtmpConfig: evmuxConfig,
  });

  // Add VDO.ninja stream as primary source
  const vdoSource = createWebSource({
    name: 'VDO.ninja Multi-Camera',
    url: `${vdoNinjaViewUrl}&cleanoutput&autostart`,
    type: 'html',
    width: 1920,
    height: 1080,
  });

  session.webSources.push(vdoSource);

  return session;
}

/**
 * Create complete production workflow
 */
export function createProductionWorkflow(config: {
  episodeId: string;
  seriesTitle: string;
  episodeNumber: number;
  vdoNinjaViewUrl: string;
  evmuxConfig: EvmuxConfig;
  youtubeStreamKey?: string;
}): BroadcastSession {
  // Create base session with VDO.ninja integration
  const session = integrateVDONinjaStream(config.vdoNinjaViewUrl, config.evmuxConfig);
  session.episodeId = config.episodeId;

  // Add title overlay
  const titleSource = WEB_SOURCE_TEMPLATES.soapOperaTitle(
    config.seriesTitle,
    config.episodeNumber
  );
  session.webSources.push(titleSource);

  // Add animated water effect
  const waterSource = WEB_SOURCE_TEMPLATES.animatedWater();
  session.webSources.push(waterSource);

  // Add YouTube destination if provided
  if (config.youtubeStreamKey) {
    const ytDestination = addYouTubeDestination(config.youtubeStreamKey);
    session.destinations.push(ytDestination);
  }

  return session;
}

/**
 * Generate FFmpeg command for streaming
 */
export function generateFFmpegCommand(
  session: BroadcastSession,
  inputSource: string
): string {
  const rtmpUrl = getRTMPUrl({
    id: session.streamId,
    url: session.rtmpUrl,
    streamKey: session.streamKey,
    status: 'idle',
  });

  return `ffmpeg -re -i "${inputSource}" \\
  -c:v libx264 -preset veryfast -maxrate 4500k -bufsize 9000k \\
  -pix_fmt yuv420p -g 60 -c:a aac -b:a 128k -ar 44100 \\
  -f flv "${rtmpUrl}"`;
}

/**
 * Stream quality presets
 */
export const STREAM_QUALITY_PRESETS = {
  '1080p60': {
    resolution: '1920x1080',
    fps: 60,
    videoBitrate: 6000,
    audioBitrate: 192,
  },
  '1080p30': {
    resolution: '1920x1080',
    fps: 30,
    videoBitrate: 4500,
    audioBitrate: 128,
  },
  '720p60': {
    resolution: '1280x720',
    fps: 60,
    videoBitrate: 4500,
    audioBitrate: 128,
  },
  '720p30': {
    resolution: '1280x720',
    fps: 30,
    videoBitrate: 2500,
    audioBitrate: 128,
  },
};

/**
 * Domino Entertainment pre-configured setup
 */
export function createDominoProductionSetup(
  episodeId: string,
  seriesTitle: 'Domino Dynasty' | 'The Domino Effect',
  episodeNumber: number,
  vdoNinjaRoom: string
): BroadcastSession {
  const evmuxConfig: EvmuxConfig = {
    rtmpUrl: EVMUX_CONFIG.rtmpEndpoint,
    appId: 'app-b6zHr3-35539f7e-1450-4412-9c6e-0372cd9bcbba',
    token: '7db2077153',
  };

  const vdoNinjaViewUrl = `https://vdo.ninja/?view=${vdoNinjaRoom}&room=Domino`;

  return createProductionWorkflow({
    episodeId,
    seriesTitle,
    episodeNumber,
    vdoNinjaViewUrl,
    evmuxConfig,
  });
}

export const evmux = {
  createStream: createRTMPStream,
  createWebSource,
  createBroadcastSession,
  addYouTubeDestination,
  addTwitchDestination,
  integrateVDONinja: integrateVDONinjaStream,
  createProductionWorkflow,
  generateOBSConfig,
  generateFFmpegCommand,
  templates: WEB_SOURCE_TEMPLATES,
  presets: STREAM_QUALITY_PRESETS,
  config: EVMUX_CONFIG,
};

export default evmux;
