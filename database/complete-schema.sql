-- ============================================
-- AI SOAP OPERA STUDIO - COMPLETE DATABASE SCHEMA
-- Optimized for Railway PostgreSQL
-- Version: 1.0.0
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'creator',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    api_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Series table
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    tone VARCHAR(100),
    target_audience VARCHAR(100),
    episode_length_minutes INTEGER DEFAULT 3,
    youtube_channel_id VARCHAR(255),
    youtube_playlist_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    total_episodes INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Characters table
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    personality TEXT,
    role VARCHAR(100),
    image_url TEXT,
    voice_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Episodes table
CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    script TEXT,
    script_version INTEGER DEFAULT 1,
    duration_seconds INTEGER,
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_publish_at TIMESTAMP,
    published_at TIMESTAMP,
    youtube_video_id VARCHAR(255),
    youtube_url TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, episode_number)
);

-- Scenes table
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    scene_number INTEGER NOT NULL,
    location VARCHAR(255),
    time_of_day VARCHAR(50),
    description TEXT,
    dialogue TEXT,
    duration_seconds INTEGER,
    video_url TEXT,
    veo_generation_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(episode_id, scene_number)
);

-- ============================================
-- VIDEO GENERATION & PROCESSING
-- ============================================

-- Video generations table
CREATE TABLE video_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    veo_job_id VARCHAR(255),
    veo_status VARCHAR(50) DEFAULT 'pending',
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    resolution VARCHAR(20),
    generation_time_seconds INTEGER,
    cost_credits DECIMAL(10, 2),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Editing jobs table
CREATE TABLE editing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    scenes_data JSONB,
    capcut_project_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    output_video_url TEXT,
    progress_percent INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- YOUTUBE INTEGRATION
-- ============================================

-- YouTube channels table
CREATE TABLE youtube_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR(255) UNIQUE NOT NULL,
    channel_name VARCHAR(255),
    subscriber_count BIGINT DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Upload queue table
CREATE TABLE upload_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    youtube_channel_id UUID REFERENCES youtube_channels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    category_id VARCHAR(50),
    privacy_status VARCHAR(50) DEFAULT 'private',
    scheduled_publish_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'queued',
    upload_progress_percent INTEGER DEFAULT 0,
    youtube_video_id VARCHAR(255),
    youtube_url TEXT,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMP
);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

-- Episode analytics table
CREATE TABLE episode_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    watch_time_minutes INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    subscribers_gained INTEGER DEFAULT 0,
    average_view_percentage DECIMAL(5, 2),
    click_through_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(episode_id, date)
);

-- Series analytics table
CREATE TABLE series_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    total_watch_time_minutes INTEGER DEFAULT 0,
    new_subscribers INTEGER DEFAULT 0,
    total_subscribers INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, date)
);

-- ============================================
-- AUTOMATION & WORKFLOWS
-- ============================================

-- Automation schedules table
CREATE TABLE automation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    schedule_type VARCHAR(50) NOT NULL,
    cron_expression VARCHAR(100),
    next_run_at TIMESTAMP,
    last_run_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions table
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    workflow_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'running',
    steps_completed INTEGER DEFAULT 0,
    steps_total INTEGER,
    current_step TEXT,
    execution_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- ============================================
-- AUDIT & LOGS
-- ============================================

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API usage table
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    credits_used DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key ON users(api_key);

-- Series indexes
CREATE INDEX idx_series_user_id ON series(user_id);
CREATE INDEX idx_series_status ON series(status);

-- Episodes indexes
CREATE INDEX idx_episodes_series_id ON episodes(series_id);
CREATE INDEX idx_episodes_status ON episodes(status);
CREATE INDEX idx_episodes_published_at ON episodes(published_at);

-- Scenes indexes
CREATE INDEX idx_scenes_episode_id ON scenes(episode_id);
CREATE INDEX idx_scenes_status ON scenes(status);

-- Video generations indexes
CREATE INDEX idx_video_generations_scene_id ON video_generations(scene_id);
CREATE INDEX idx_video_generations_veo_status ON video_generations(veo_status);

-- Upload queue indexes
CREATE INDEX idx_upload_queue_status ON upload_queue(status);
CREATE INDEX idx_upload_queue_scheduled ON upload_queue(scheduled_publish_at);

-- Analytics indexes
CREATE INDEX idx_episode_analytics_episode_date ON episode_analytics(episode_id, date);
CREATE INDEX idx_series_analytics_series_date ON series_analytics(series_id, date);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA FOR DOMINO ENTERTAINMENT
-- ============================================

-- Insert sample user (Domino Entertainment)
INSERT INTO users (email, name, role, subscription_tier)
VALUES ('dominoentertainment@example.com', 'Domino Entertainment', 'admin', 'enterprise')
ON CONFLICT (email) DO NOTHING;

-- Insert sample series templates
INSERT INTO series (user_id, title, description, genre, tone, target_audience)
SELECT
    u.id,
    'Domino Dynasty',
    'A gripping family saga about power, betrayal, and redemption in modern-day business empire',
    'Drama',
    'Dramatic, Intense',
    'Adults 25-54'
FROM users u
WHERE u.email = 'dominoentertainment@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO series (user_id, title, description, genre, tone, target_audience)
SELECT
    u.id,
    'The Domino Effect',
    'Psychological thriller exploring how one decision changes everything',
    'Thriller',
    'Suspenseful, Dark',
    'Adults 18-44'
FROM users u
WHERE u.email = 'dominoentertainment@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANTS & PERMISSIONS
-- ============================================

-- Grant permissions (adjust based on Railway setup)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================
-- COMPLETION
-- ============================================

COMMENT ON DATABASE postgres IS 'AI Soap Opera Studio - Production Database';
