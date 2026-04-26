-- ============================================
-- EVMUX PROFESSIONAL STREAMING - DATABASE SCHEMA
-- ============================================
-- RTMP streaming, web sources, multi-platform broadcasting

-- Broadcast sessions table
CREATE TABLE IF NOT EXISTS broadcast_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    recording_session_id UUID REFERENCES recording_sessions(id) ON DELETE SET NULL,
    stream_id VARCHAR(255) NOT NULL,
    rtmp_url TEXT NOT NULL,
    stream_key TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'setup',
    quality_preset VARCHAR(50) DEFAULT '1080p30',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    total_viewers INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Web sources table (overlays, titles, animations)
CREATE TABLE IF NOT EXISTS web_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broadcast_session_id UUID REFERENCES broadcast_sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'html', 'overlay', 'title', 'animation'
    width INTEGER DEFAULT 1920,
    height INTEGER DEFAULT 1080,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    z_index INTEGER DEFAULT 10,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stream destinations table (YouTube, Twitch, etc.)
CREATE TABLE IF NOT EXISTS stream_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broadcast_session_id UUID REFERENCES broadcast_sessions(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'youtube', 'twitch', 'facebook', 'custom'
    rtmp_url TEXT NOT NULL,
    stream_key TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'streaming', 'error', 'stopped'
    viewers INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP,
    stopped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stream metrics table (real-time analytics)
CREATE TABLE IF NOT EXISTS stream_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broadcast_session_id UUID REFERENCES broadcast_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    viewers INTEGER DEFAULT 0,
    bitrate_kbps INTEGER,
    fps INTEGER,
    dropped_frames INTEGER DEFAULT 0,
    cpu_usage DECIMAL(5, 2),
    bandwidth_mbps DECIMAL(10, 2),
    latency_ms INTEGER,
    quality_score DECIMAL(5, 2),
    metadata JSONB
);

-- Production workflows table (VDO.ninja + evmux integration)
CREATE TABLE IF NOT EXISTS production_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    recording_session_id UUID REFERENCES recording_sessions(id) ON DELETE SET NULL,
    broadcast_session_id UUID REFERENCES broadcast_sessions(id) ON DELETE SET NULL,
    workflow_type VARCHAR(50) NOT NULL, -- 'vdo_only', 'evmux_only', 'hybrid'
    status VARCHAR(50) DEFAULT 'setup',
    steps JSONB,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_broadcast_sessions_episode ON broadcast_sessions(episode_id);
CREATE INDEX idx_broadcast_sessions_status ON broadcast_sessions(status);
CREATE INDEX idx_web_sources_broadcast ON web_sources(broadcast_session_id);
CREATE INDEX idx_stream_destinations_broadcast ON stream_destinations(broadcast_session_id);
CREATE INDEX idx_stream_destinations_platform ON stream_destinations(platform);
CREATE INDEX idx_stream_metrics_broadcast ON stream_metrics(broadcast_session_id);
CREATE INDEX idx_stream_metrics_timestamp ON stream_metrics(timestamp);
CREATE INDEX idx_production_workflows_episode ON production_workflows(episode_id);

-- Update triggers
CREATE TRIGGER update_broadcast_sessions_updated_at
BEFORE UPDATE ON broadcast_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_web_sources_updated_at
BEFORE UPDATE ON web_sources
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stream_destinations_updated_at
BEFORE UPDATE ON stream_destinations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for Domino Entertainment
INSERT INTO broadcast_sessions (
    episode_id,
    stream_id,
    rtmp_url,
    stream_key,
    status,
    quality_preset,
    metadata
)
SELECT
    e.id,
    'stream_domino_' || e.episode_number,
    'rtmp://rtmp1.us-east-1.evmux.com/live',
    'app-b6zHr3-35539f7e-1450-4412-9c6e-0372cd9bcbba?token=7db2077153',
    'setup',
    '1080p30',
    '{"configured_for": "Domino Entertainment"}'::jsonb
FROM episodes e
WHERE e.series_id IN (SELECT id FROM series WHERE title LIKE 'Domino%')
LIMIT 1
ON CONFLICT DO NOTHING;

-- Helper function: Get active broadcast for episode
CREATE OR REPLACE FUNCTION get_active_broadcast(p_episode_id UUID)
RETURNS TABLE (
    broadcast_id UUID,
    rtmp_url TEXT,
    stream_key TEXT,
    status VARCHAR,
    web_sources_count BIGINT,
    destinations_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bs.id,
        bs.rtmp_url,
        bs.stream_key,
        bs.status,
        (SELECT COUNT(*) FROM web_sources ws WHERE ws.broadcast_session_id = bs.id AND ws.is_enabled = true),
        (SELECT COUNT(*) FROM stream_destinations sd WHERE sd.broadcast_session_id = bs.id AND sd.is_enabled = true)
    FROM broadcast_sessions bs
    WHERE bs.episode_id = p_episode_id
      AND bs.status IN ('setup', 'live')
    ORDER BY bs.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Helper function: Record stream metrics
CREATE OR REPLACE FUNCTION record_stream_metric(
    p_broadcast_id UUID,
    p_viewers INTEGER,
    p_bitrate INTEGER,
    p_fps INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO stream_metrics (
        broadcast_session_id,
        viewers,
        bitrate_kbps,
        fps,
        timestamp
    ) VALUES (
        p_broadcast_id,
        p_viewers,
        p_bitrate,
        p_fps,
        NOW()
    );

    -- Update broadcast session peak viewers
    UPDATE broadcast_sessions
    SET peak_viewers = GREATEST(peak_viewers, p_viewers)
    WHERE id = p_broadcast_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE broadcast_sessions IS 'evmux RTMP broadcast sessions with multi-platform streaming';
COMMENT ON TABLE web_sources IS 'Web source overlays, titles, and animations for broadcasts';
COMMENT ON TABLE stream_destinations IS 'Multi-platform streaming destinations (YouTube, Twitch, etc.)';
COMMENT ON TABLE stream_metrics IS 'Real-time streaming analytics and performance metrics';
COMMENT ON TABLE production_workflows IS 'Complete production workflows combining VDO.ninja and evmux';
