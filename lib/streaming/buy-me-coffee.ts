// Buy Me a Coffee stream alerts integration
// User key: 42413ab8b4066661c7734270e3057ce0

export const BMC_USER_KEY = '42413ab8b4066661c7734270e3057ce0';
export const BMC_STREAM_ALERT_URL = `https://studio.buymeacoffee.com/stream-alert/page/evmux?user_key=${BMC_USER_KEY}`;
export const BMC_OVERLAY_URL = `https://studio.buymeacoffee.com/stream-alert?user_key=${BMC_USER_KEY}`;

export interface BmcAlertPayload {
  type: 'donation' | 'membership' | 'extras';
  from: string;
  amount?: number;
  currency?: string;
  message?: string;
  timestamp: string;
}

// Webhook handler for BMC stream alert events
export function parseBmcWebhookPayload(payload: Record<string, unknown>): BmcAlertPayload | null {
  try {
    return {
      type: (payload.type as BmcAlertPayload['type']) || 'donation',
      from: (payload.supporter_name as string) || 'Anonymous',
      amount: payload.amount as number | undefined,
      currency: (payload.currency as string) || 'USD',
      message: payload.support_note as string | undefined,
      timestamp: (payload.created_at as string) || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// Build OBS browser source URL for BMC alerts overlay
export function getBmcObsOverlayUrl(userKey: string = BMC_USER_KEY): string {
  return `https://studio.buymeacoffee.com/stream-alert?user_key=${userKey}&animation=slide&position=bottom-right`;
}

// Build evmux web source URL for BMC alerts
export function getBmcEvmuxSourceUrl(userKey: string = BMC_USER_KEY): string {
  return `https://studio.buymeacoffee.com/stream-alert/page/evmux?user_key=${userKey}`;
}

// Social Stream Ninja consolidated chat
export interface SocialStreamConfig {
  platforms: ('youtube' | 'twitch' | 'facebook' | 'tiktok' | 'instagram')[];
  youtubeChannelId?: string;
  twitchChannel?: string;
  facebookPageId?: string;
}

export function buildSocialStreamUrl(config: SocialStreamConfig): string {
  const params = new URLSearchParams();
  config.platforms.forEach((p) => params.append('p', p));
  if (config.youtubeChannelId) params.set('yt', config.youtubeChannelId);
  if (config.twitchChannel) params.set('twitch', config.twitchChannel);
  if (config.facebookPageId) params.set('fb', config.facebookPageId);
  return `https://socialstream.ninja/?${params.toString()}`;
}

// Build consolidated chat overlay URL
export function buildChatOverlayUrl(config: SocialStreamConfig): string {
  const params = new URLSearchParams();
  config.platforms.forEach((p) => params.append('p', p));
  return `https://socialstream.ninja/overlay/?${params.toString()}`;
}
