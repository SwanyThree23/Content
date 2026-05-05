-- Payments & Live Panels Schema
-- Direct payment system: PayPal, CashApp, Venmo, Zelle, Chime
-- Live streaming panels: 9+ guests, expandable Bigo-style
-- Video posts (10 min max), audio panels, private panels, social sharing

-- ============================================================
-- DIRECT PAYMENT METHODS
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('paypal', 'cashapp', 'venmo', 'zelle', 'chime')),
  display_name VARCHAR(100),
  handle VARCHAR(200) NOT NULL,       -- $cashtag, @venmo, email, phone, link
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, method_type)
);

-- Payment transactions (off-platform direct)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  creator_receives_cents INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'confirmed', 'failed', 'disputed')),
  external_reference VARCHAR(500),     -- PayPal transaction ID, etc.
  message TEXT,
  session_id UUID,                     -- Live session where payment happened
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Fee schedule (90% to creator model)
CREATE TABLE IF NOT EXISTS fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method VARCHAR(20) NOT NULL,
  min_amount_cents INTEGER DEFAULT 0,
  max_amount_cents INTEGER,
  platform_fee_pct NUMERIC(5,4) DEFAULT 0.10,   -- 10% platform, 90% creator
  fixed_fee_cents INTEGER DEFAULT 0,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  PRIMARY KEY (id)
);

INSERT INTO fee_schedules (payment_method, platform_fee_pct) VALUES
  ('paypal', 0.10),
  ('cashapp', 0.10),
  ('venmo', 0.10),
  ('zelle', 0.10),
  ('chime', 0.10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- LIVE STREAMING PANELS (SeeWhy-style)
-- ============================================================
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  session_type VARCHAR(20) DEFAULT 'video' CHECK (session_type IN ('video', 'audio', 'screen')),
  is_private BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  max_guests INTEGER DEFAULT 9,
  viewer_count INTEGER DEFAULT 0,
  peak_viewer_count INTEGER DEFAULT 0,
  -- VDO.ninja integration
  vdo_room_id VARCHAR(200),
  vdo_host_url TEXT,
  vdo_guest_url TEXT,
  -- evmux integration
  evmux_session_id VARCHAR(200),
  evmux_rtmp_url TEXT,
  -- Meshcast CDN for large rooms
  meshcast_url TEXT,
  -- Social sharing
  share_instagram BOOLEAN DEFAULT false,
  share_facebook BOOLEAN DEFAULT false,
  share_tiktok BOOLEAN DEFAULT false,
  share_snapchat BOOLEAN DEFAULT false,
  -- Monetization
  direct_payments_enabled BOOLEAN DEFAULT true,
  buy_me_coffee_enabled BOOLEAN DEFAULT false,
  buy_me_coffee_user_key VARCHAR(200),
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests/panels in a live session
CREATE TABLE IF NOT EXISTS live_session_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_name VARCHAR(200),
  panel_slot INTEGER NOT NULL CHECK (panel_slot BETWEEN 1 AND 12),
  is_expanded BOOLEAN DEFAULT false,     -- Bigo-style expandable panel
  is_featured BOOLEAN DEFAULT false,     -- Main/spotlight view
  is_muted BOOLEAN DEFAULT false,
  panel_type VARCHAR(20) DEFAULT 'video' CHECK (panel_type IN ('video', 'audio', 'screen')),
  vdo_stream_id VARCHAR(200),
  connection_status VARCHAR(20) DEFAULT 'connecting' CHECK (connection_status IN ('connecting', 'connected', 'disconnected', 'error')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- Panel layout configurations
CREATE TABLE IF NOT EXISTS panel_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  layout_type VARCHAR(30) DEFAULT 'grid' CHECK (layout_type IN ('grid', 'spotlight', 'sidebar', 'bigo', 'theater')),
  guest_count INTEGER DEFAULT 1,
  config JSONB DEFAULT '{}',            -- Panel positions, sizes, etc.
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIDEO POSTS (10 min max, paywalled)
-- ============================================================
CREATE TABLE IF NOT EXISTS video_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  duration_seconds INTEGER CHECK (duration_seconds <= 600),  -- 10 min max
  video_url TEXT,
  thumbnail_url TEXT,
  is_paywalled BOOLEAN DEFAULT false,
  paywall_price_cents INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  -- AI-generated content
  ai_generated BOOLEAN DEFAULT false,
  veo3_job_id VARCHAR(200),
  -- Social sharing
  published_instagram BOOLEAN DEFAULT false,
  published_facebook BOOLEAN DEFAULT false,
  published_tiktok BOOLEAN DEFAULT false,
  published_snapchat BOOLEAN DEFAULT false,
  published_youtube BOOLEAN DEFAULT false,
  youtube_video_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video post access (paywall unlock)
CREATE TABLE IF NOT EXISTS video_post_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_post_id UUID NOT NULL REFERENCES video_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_post_id, user_id)
);

-- ============================================================
-- SOCIAL SHARING
-- ============================================================
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(30) NOT NULL CHECK (resource_type IN ('live_session', 'video_post', 'episode', 'series')),
  resource_id UUID NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'snapchat', 'youtube', 'twitter', 'copy_link')),
  share_url TEXT,
  external_post_id VARCHAR(300),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shared', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STREAM ALERTS (Buy Me a Coffee)
-- ============================================================
CREATE TABLE IF NOT EXISTS stream_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
  alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('donation', 'follower', 'subscriber', 'payment', 'message')),
  from_name VARCHAR(200),
  amount_cents INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',
  message TEXT,
  platform VARCHAR(20) DEFAULT 'buy_me_coffee',
  external_id VARCHAR(300),
  is_displayed BOOLEAN DEFAULT false,
  displayed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOCIAL STREAM NINJA (consolidated chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS stream_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL CHECK (platform IN ('youtube', 'twitch', 'facebook', 'tiktok', 'instagram', 'direct')),
  sender_name VARCHAR(200),
  sender_avatar_url TEXT,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'superchat', 'follow', 'subscribe', 'donation')),
  amount_cents INTEGER,
  external_message_id VARCHAR(300),
  is_pinned BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEVICE PERMISSIONS LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS device_permission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(200),
  permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('camera', 'microphone', 'screen')),
  error_state VARCHAR(50),             -- NotAllowedError, NotFoundError, etc.
  browser VARCHAR(50),
  os VARCHAR(50),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_recipient ON payment_transactions(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_sender ON payment_transactions(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_host ON live_sessions(host_user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_active ON live_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_live_session_guests_session ON live_session_guests(session_id);
CREATE INDEX IF NOT EXISTS idx_video_posts_creator ON video_posts(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_video_posts_status ON video_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_shares_resource ON social_shares(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_stream_alerts_session ON stream_alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_session ON stream_chat_messages(session_id, created_at DESC);
