// VDO.ninja Integration for Live Actor Recordings
// Peer-to-peer video streaming and recording

export interface VDONinjaRoom {
  roomId: string;
  password?: string;
  viewUrl: string;
  pushUrl: string;
  directorUrl: string;
  guestUrls: string[];
}

export interface VDONinjaStreamConfig {
  roomName: string;
  password?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  stereo?: boolean;
  solo?: boolean;
  scene?: string;
  videobitrate?: number;
  audiobitrate?: number;
}

export interface RecordingSession {
  id: string;
  episodeId: string;
  sceneNumber: number;
  roomId: string;
  status: 'setup' | 'recording' | 'processing' | 'completed' | 'failed';
  actors: Array<{
    name: string;
    character: string;
    streamId: string;
    streamUrl: string;
  }>;
  startedAt?: Date;
  completedAt?: Date;
  recordingUrl?: string;
}

/**
 * Generate VDO.ninja room configuration
 */
export function createVDONinjaRoom(config: VDONinjaStreamConfig): VDONinjaRoom {
  const roomId = config.roomName.replace(/\s+/g, '');
  const baseUrl = 'https://vdo.ninja';

  const params = new URLSearchParams();
  if (config.password) params.append('password', config.password);
  if (config.quality) params.append('quality', config.quality);
  if (config.stereo) params.append('stereo', '1');
  if (config.solo) params.append('solo', '1');
  if (config.scene) params.append('scene', config.scene);
  if (config.videobitrate) params.append('videobitrate', config.videobitrate.toString());
  if (config.audiobitrate) params.append('audiobitrate', config.audiobitrate.toString());

  const room = {
    roomId,
    password: config.password,

    // Director URL (control room)
    directorUrl: `${baseUrl}/?director=${roomId}&${params.toString()}`,

    // Push URL (for actors/guests)
    pushUrl: `${baseUrl}/?push=${roomId}&${params.toString()}`,

    // View URL (for monitoring)
    viewUrl: `${baseUrl}/?view=${roomId}&${params.toString()}`,

    guestUrls: [],
  };

  return room;
}

/**
 * Generate individual actor/guest URLs
 */
export function createActorStreamUrl(
  roomId: string,
  actorName: string,
  options?: {
    password?: string;
    solo?: boolean;
    label?: string;
    scene?: string;
  }
): string {
  const baseUrl = 'https://vdo.ninja';
  const params = new URLSearchParams();

  params.append('push', actorName.replace(/\s+/g, ''));
  params.append('room', roomId);

  if (options?.password) params.append('password', options.password);
  if (options?.solo) params.append('solo', '1');
  if (options?.label) params.append('label', options.label);
  if (options?.scene) params.append('scene', options.scene);

  return `${baseUrl}/?${params.toString()}`;
}

/**
 * Generate multi-camera scene setup
 */
export function createMultiCameraScene(
  roomId: string,
  actors: Array<{ name: string; character: string }>,
  options?: {
    password?: string;
    scene?: string;
  }
): {
  directorUrl: string;
  actorUrls: Array<{ actor: string; character: string; url: string }>;
  viewUrl: string;
} {
  const baseUrl = 'https://vdo.ninja';

  // Director URL with scene control
  const directorParams = new URLSearchParams({
    director: roomId,
    room: roomId,
    scene: options?.scene || '1',
  });
  if (options?.password) directorParams.append('password', options.password);

  // Generate URL for each actor
  const actorUrls = actors.map((actor, index) => ({
    actor: actor.name,
    character: actor.character,
    url: createActorStreamUrl(roomId, actor.name, {
      password: options?.password,
      solo: true,
      label: actor.character,
      scene: options?.scene,
    }),
  }));

  // View URL for monitoring all streams
  const viewParams = new URLSearchParams({
    view: roomId,
    room: roomId,
  });
  if (options?.password) viewParams.append('password', options.password);

  return {
    directorUrl: `${baseUrl}/?${directorParams.toString()}`,
    actorUrls,
    viewUrl: `${baseUrl}/?${viewParams.toString()}`,
  };
}

/**
 * Parse VDO.ninja URL to extract parameters
 */
export function parseVDONinjaUrl(url: string): {
  type: 'director' | 'push' | 'view' | 'unknown';
  roomId?: string;
  streamId?: string;
  password?: string;
  scene?: string;
  params: Record<string, string>;
} {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    let type: 'director' | 'push' | 'view' | 'unknown' = 'unknown';
    let roomId: string | undefined;
    let streamId: string | undefined;

    if (params.director) {
      type = 'director';
      roomId = params.director;
    } else if (params.push) {
      type = 'push';
      streamId = params.push;
      roomId = params.room;
    } else if (params.view) {
      type = 'view';
      streamId = params.view;
      roomId = params.room;
    }

    return {
      type,
      roomId,
      streamId,
      password: params.password,
      scene: params.scene || params.scn,
      params,
    };
  } catch (error) {
    return {
      type: 'unknown',
      params: {},
    };
  }
}

/**
 * Generate recording configuration for OBS/ffmpeg
 */
export function generateRecordingConfig(room: VDONinjaRoom): {
  obsUrl: string;
  ffmpegCommand: string;
} {
  // OBS Browser Source URL
  const obsUrl = `${room.viewUrl}&cleanoutput&autostart`;

  // FFmpeg command for recording
  const ffmpegCommand = `ffmpeg -f lavfi -i anullsrc -rtsp_transport tcp \\
    -i "${obsUrl}" \\
    -c:v libx264 -preset veryfast -crf 23 \\
    -c:a aac -b:a 128k \\
    -t 300 \\
    output.mp4`;

  return {
    obsUrl,
    ffmpegCommand,
  };
}

/**
 * Create workflow for episode scene recording
 */
export function createSceneRecordingWorkflow(
  seriesTitle: string,
  episodeNumber: number,
  sceneNumber: number,
  actors: Array<{ name: string; character: string }>
): RecordingSession {
  const roomName = `${seriesTitle.replace(/\s+/g, '')}_E${episodeNumber}_S${sceneNumber}`;
  const password = Math.random().toString(36).substring(7);

  const multiCam = createMultiCameraScene(roomName, actors, { password });

  return {
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    episodeId: '', // To be set by caller
    sceneNumber,
    roomId: roomName,
    status: 'setup',
    actors: actors.map((actor, index) => ({
      name: actor.name,
      character: actor.character,
      streamId: actor.name.replace(/\s+/g, ''),
      streamUrl: multiCam.actorUrls[index].url,
    })),
  };
}

/**
 * VDO.ninja quality presets
 */
export const QUALITY_PRESETS = {
  low: {
    videobitrate: 500,
    audiobitrate: 64,
    quality: 'low' as const,
  },
  medium: {
    videobitrate: 1500,
    audiobitrate: 128,
    quality: 'medium' as const,
  },
  high: {
    videobitrate: 3000,
    audiobitrate: 192,
    quality: 'high' as const,
  },
  ultra: {
    videobitrate: 6000,
    audiobitrate: 256,
    quality: 'ultra' as const,
  },
};

/**
 * Create URLs for Domino Entertainment examples
 */
export function createDominoRooms(): {
  dynasty: VDONinjaRoom;
  effect: VDONinjaRoom;
} {
  return {
    dynasty: createVDONinjaRoom({
      roomName: 'DominoDynasty',
      password: 'domino2024',
      quality: 'high',
      stereo: true,
    }),
    effect: createVDONinjaRoom({
      roomName: 'DominoEffect',
      password: 'domino2024',
      quality: 'high',
      stereo: true,
    }),
  };
}

export const vdoNinja = {
  createRoom: createVDONinjaRoom,
  createActorUrl: createActorStreamUrl,
  createMultiCamera: createMultiCameraScene,
  parseUrl: parseVDONinjaUrl,
  createRecordingWorkflow: createSceneRecordingWorkflow,
  generateRecordingConfig,
  QUALITY_PRESETS,
};

export default vdoNinja;
