-- ============================================
-- VDO.NINJA INTEGRATION - DATABASE SCHEMA
-- ============================================
-- Add live streaming and recording capabilities

-- Recording sessions table
CREATE TABLE IF NOT EXISTS recording_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    room_id VARCHAR(255) NOT NULL,
    room_password VARCHAR(255),
    status VARCHAR(50) DEFAULT 'setup',
    director_url TEXT,
    view_url TEXT,
    recording_url TEXT,
    quality_preset VARCHAR(50) DEFAULT 'high',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actor streams table (for multi-camera recording)
CREATE TABLE IF NOT EXISTS actor_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_session_id UUID REFERENCES recording_sessions(id) ON DELETE CASCADE,
    actor_name VARCHAR(255) NOT NULL,
    character_name VARCHAR(255),
    stream_id VARCHAR(255) NOT NULL,
    stream_url TEXT NOT NULL,
    push_url TEXT,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recording files table (for processed recordings)
CREATE TABLE IF NOT EXISTS recording_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_session_id UUID REFERENCES recording_sessions(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL, -- 'raw', 'processed', 'final'
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    resolution VARCHAR(20),
    codec VARCHAR(50),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Live stream analytics
CREATE TABLE IF NOT EXISTS stream_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_session_id UUID REFERENCES recording_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    viewer_count INTEGER DEFAULT 0,
    bandwidth_mbps DECIMAL(10, 2),
    quality_score DECIMAL(5, 2),
    latency_ms INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_recording_sessions_episode ON recording_sessions(episode_id);
CREATE INDEX idx_recording_sessions_status ON recording_sessions(status);
CREATE INDEX idx_actor_streams_session ON actor_streams(recording_session_id);
CREATE INDEX idx_recording_files_session ON recording_files(recording_session_id);
CREATE INDEX idx_stream_analytics_session ON stream_analytics(recording_session_id);

-- Update trigger
CREATE TRIGGER update_recording_sessions_updated_at
BEFORE UPDATE ON recording_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for Domino Entertainment
INSERT INTO recording_sessions (
    episode_id,
    room_id,
    room_password,
    status,
    director_url,
    view_url,
    quality_preset
)
SELECT
    e.id,
    'DominoDynasty',
    'domino2024',
    'setup',
    'https://vdo.ninja/?director=DominoDynasty&password=domino2024',
    'https://vdo.ninja/?view=DominoDynasty&password=domino2024',
    'high'
FROM episodes e
WHERE e.series_id IN (SELECT id FROM series WHERE title = 'Domino Dynasty')
LIMIT 1
ON CONFLICT DO NOTHING;

COMMENT ON TABLE recording_sessions IS 'VDO.ninja recording sessions for live actor performances';
COMMENT ON TABLE actor_streams IS 'Individual actor streams in multi-camera setup';
COMMENT ON TABLE recording_files IS 'Recorded and processed video files';
COMMENT ON TABLE stream_analytics IS 'Real-time streaming analytics';
