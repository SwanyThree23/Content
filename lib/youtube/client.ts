// YouTube API integration for automated uploads
import { google } from 'googleapis';
import fs from 'fs';
import { Readable } from 'stream';

const youtube = google.youtube('v3');

export interface YouTubeCredentials {
  access_token: string;
  refresh_token: string;
  expiry_date?: number;
}

export interface VideoUploadParams {
  title: string;
  description: string;
  tags: string[];
  categoryId?: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
  scheduledPublishAt?: Date;
  filePath?: string;
  fileStream?: Readable;
  thumbnailPath?: string;
}

export interface VideoUploadResult {
  videoId: string;
  url: string;
  status: string;
}

/**
 * Create OAuth2 client with credentials
 */
export function createYouTubeClient(credentials: YouTubeCredentials) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token,
    expiry_date: credentials.expiry_date
  });

  return oauth2Client;
}

/**
 * Upload video to YouTube
 */
export async function uploadVideo(
  credentials: YouTubeCredentials,
  params: VideoUploadParams
): Promise<VideoUploadResult> {
  const auth = createYouTubeClient(credentials);

  const requestBody = {
    snippet: {
      title: params.title,
      description: params.description,
      tags: params.tags,
      categoryId: params.categoryId || '24', // Entertainment
    },
    status: {
      privacyStatus: params.privacyStatus,
      publishAt: params.scheduledPublishAt?.toISOString(),
      selfDeclaredMadeForKids: false,
    },
  };

  const media = {
    body: params.fileStream || fs.createReadStream(params.filePath!),
  };

  try {
    const response = await youtube.videos.insert({
      auth,
      part: ['snippet', 'status'],
      requestBody,
      media,
    });

    const videoId = response.data.id!;

    // Upload thumbnail if provided
    if (params.thumbnailPath && fs.existsSync(params.thumbnailPath)) {
      await uploadThumbnail(auth, videoId, params.thumbnailPath);
    }

    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      status: response.data.status?.uploadStatus || 'uploaded',
    };
  } catch (error: any) {
    console.error('YouTube upload error:', error);
    throw new Error(`Failed to upload video: ${error.message}`);
  }
}

/**
 * Upload custom thumbnail
 */
export async function uploadThumbnail(
  auth: any,
  videoId: string,
  thumbnailPath: string
): Promise<void> {
  try {
    await youtube.thumbnails.set({
      auth,
      videoId,
      media: {
        body: fs.createReadStream(thumbnailPath),
      },
    });
  } catch (error: any) {
    console.error('Thumbnail upload error:', error);
    // Don't fail the entire upload if thumbnail fails
  }
}

/**
 * Get video statistics
 */
export async function getVideoStats(
  credentials: YouTubeCredentials,
  videoId: string
) {
  const auth = createYouTubeClient(credentials);

  const response = await youtube.videos.list({
    auth,
    part: ['statistics', 'status'],
    id: [videoId],
  });

  const video = response.data.items?.[0];
  if (!video) {
    throw new Error('Video not found');
  }

  return {
    views: parseInt(video.statistics?.viewCount || '0'),
    likes: parseInt(video.statistics?.likeCount || '0'),
    comments: parseInt(video.statistics?.commentCount || '0'),
    status: video.status?.uploadStatus,
  };
}

/**
 * Create or get playlist
 */
export async function createPlaylist(
  credentials: YouTubeCredentials,
  title: string,
  description: string
): Promise<string> {
  const auth = createYouTubeClient(credentials);

  const response = await youtube.playlists.insert({
    auth,
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
      },
      status: {
        privacyStatus: 'public',
      },
    },
  });

  return response.data.id!;
}

/**
 * Add video to playlist
 */
export async function addToPlaylist(
  credentials: YouTubeCredentials,
  playlistId: string,
  videoId: string,
  position?: number
): Promise<void> {
  const auth = createYouTubeClient(credentials);

  await youtube.playlistItems.insert({
    auth,
    part: ['snippet'],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId,
        },
        position,
      },
    },
  });
}

/**
 * Get channel statistics
 */
export async function getChannelStats(credentials: YouTubeCredentials) {
  const auth = createYouTubeClient(credentials);

  const response = await youtube.channels.list({
    auth,
    part: ['statistics', 'snippet'],
    mine: true,
  });

  const channel = response.data.items?.[0];
  if (!channel) {
    throw new Error('Channel not found');
  }

  return {
    channelId: channel.id!,
    title: channel.snippet?.title || '',
    subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
    totalViews: parseInt(channel.statistics?.viewCount || '0'),
    videoCount: parseInt(channel.statistics?.videoCount || '0'),
  };
}

/**
 * Generate OAuth URL for user authorization
 */
export function getAuthUrl(state?: string): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    state,
  });
}

/**
 * Exchange auth code for tokens
 */
export async function getTokensFromCode(code: string): Promise<YouTubeCredentials> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token!,
    expiry_date: tokens.expiry_date,
  };
}

/**
 * Refresh expired access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<YouTubeCredentials> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    access_token: credentials.access_token!,
    refresh_token: credentials.refresh_token || refreshToken,
    expiry_date: credentials.expiry_date,
  };
}

export const youtubeClient = {
  uploadVideo,
  getVideoStats,
  createPlaylist,
  addToPlaylist,
  getChannelStats,
  getAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
};

export default youtubeClient;
