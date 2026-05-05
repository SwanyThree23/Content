// Core TypeScript types for AI Soap Opera Studio

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'creator' | 'studio' | 'enterprise';
  created_at: string;
}

export interface Series {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  genre?: string;
  setting?: string;
  tone?: string;
  target_audience?: string;
  episode_count: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  series_id: string;
  episode_number: number;
  title: string;
  synopsis?: string;
  script?: string;
  status: 'draft' | 'scripted' | 'recording' | 'processing' | 'editing' | 'published' | 'scheduled';
  youtube_video_id?: string;
  scheduled_publish_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  episode_id: string;
  scene_number: number;
  title?: string;
  description?: string;
  visual_prompt?: string;
  dialogue?: string;
  estimated_duration?: number;
  video_url?: string;
  status: 'draft' | 'generating' | 'generated' | 'approved';
}

// ============================================================
// PAYMENT TYPES
// ============================================================
export type PaymentMethodType = 'paypal' | 'cashapp' | 'venmo' | 'zelle' | 'chime';

export interface PaymentMethod {
  id: string;
  user_id: string;
  method_type: PaymentMethodType;
  display_name?: string;
  handle: string;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  sender_user_id?: string;
  recipient_user_id: string;
  payment_method_id: string;
  amount_cents: number;
  currency: string;
  platform_fee_cents: number;
  creator_receives_cents: number;
  status: 'initiated' | 'confirmed' | 'failed' | 'disputed';
  external_reference?: string;
  message?: string;
  session_id?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface FeeCalculation {
  amount_cents: number;
  platform_fee_cents: number;
  creator_receives_cents: number;
  creator_pct: number;       // 0.90 = 90%
  platform_pct: number;      // 0.10 = 10%
}

// ============================================================
// LIVE SESSION TYPES
// ============================================================
export type SessionType = 'video' | 'audio' | 'screen';
export type PanelType = 'video' | 'audio' | 'screen';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export type LayoutType = 'grid' | 'spotlight' | 'sidebar' | 'bigo' | 'theater';

export interface LiveSession {
  id: string;
  host_user_id: string;
  series_id?: string;
  title: string;
  description?: string;
  session_type: SessionType;
  is_private: boolean;
  is_active: boolean;
  max_guests: number;
  viewer_count: number;
  peak_viewer_count: number;
  vdo_room_id?: string;
  vdo_host_url?: string;
  vdo_guest_url?: string;
  evmux_session_id?: string;
  evmux_rtmp_url?: string;
  meshcast_url?: string;
  share_instagram: boolean;
  share_facebook: boolean;
  share_tiktok: boolean;
  share_snapchat: boolean;
  direct_payments_enabled: boolean;
  buy_me_coffee_enabled: boolean;
  buy_me_coffee_user_key?: string;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface LiveSessionGuest {
  id: string;
  session_id: string;
  user_id?: string;
  guest_name?: string;
  panel_slot: number;         // 1–12
  is_expanded: boolean;       // Bigo-style fullscreen expand
  is_featured: boolean;       // Spotlight view
  is_muted: boolean;
  panel_type: PanelType;
  vdo_stream_id?: string;
  connection_status: ConnectionStatus;
  joined_at: string;
  left_at?: string;
}

export interface PanelLayout {
  id: string;
  user_id: string;
  name: string;
  layout_type: LayoutType;
  guest_count: number;
  config: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

// ============================================================
// VIDEO POST TYPES
// ============================================================
export interface VideoPost {
  id: string;
  creator_user_id: string;
  series_id?: string;
  title: string;
  description?: string;
  duration_seconds?: number;
  video_url?: string;
  thumbnail_url?: string;
  is_paywalled: boolean;
  paywall_price_cents: number;
  view_count: number;
  like_count: number;
  ai_generated: boolean;
  status: 'draft' | 'processing' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
}

// ============================================================
// STREAM ALERT TYPES
// ============================================================
export type AlertType = 'donation' | 'follower' | 'subscriber' | 'payment' | 'message';
export type ChatPlatform = 'youtube' | 'twitch' | 'facebook' | 'tiktok' | 'instagram' | 'direct';

export interface StreamAlert {
  id: string;
  user_id: string;
  session_id?: string;
  alert_type: AlertType;
  from_name?: string;
  amount_cents?: number;
  currency: string;
  message?: string;
  platform: string;
  is_displayed: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  platform: ChatPlatform;
  sender_name?: string;
  sender_avatar_url?: string;
  message: string;
  message_type: 'chat' | 'superchat' | 'follow' | 'subscribe' | 'donation';
  amount_cents?: number;
  is_pinned: boolean;
  is_highlighted: boolean;
  created_at: string;
}

// ============================================================
// DEVICE PERMISSION TYPES
// ============================================================
export type PermissionErrorState =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'SecurityError'
  | 'AbortError';

export interface DevicePermissionResult {
  granted: boolean;
  stream?: MediaStream;
  error?: PermissionErrorState;
  errorMessage?: string;
  devices?: MediaDeviceInfo[];
}

// ============================================================
// VDO.NINJA IFRAME API TYPES
// ============================================================
export interface VdoNinjaIframeEvent {
  action: string;
  value?: unknown;
  UUID?: string;
}

export interface VdoNinjaRoom {
  room_id: string;
  host_url: string;
  guest_url: string;
  director_url: string;
  meshcast_url?: string;
  max_guests: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
