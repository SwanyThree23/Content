// Database connection and query utilities
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection (Railway optimized)
export const sql = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Type-safe query helpers
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscription_tier: string;
  api_key: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Series {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  tone: string | null;
  target_audience: string | null;
  episode_length_minutes: number;
  youtube_channel_id: string | null;
  youtube_playlist_id: string | null;
  status: string;
  total_episodes: number;
  total_views: number;
  created_at: Date;
  updated_at: Date;
}

export interface Episode {
  id: string;
  series_id: string;
  episode_number: number;
  title: string;
  synopsis: string | null;
  script: string | null;
  script_version: number;
  duration_seconds: number | null;
  status: string;
  scheduled_publish_at: Date | null;
  published_at: Date | null;
  youtube_video_id: string | null;
  youtube_url: string | null;
  views: number;
  likes: number;
  comments: number;
  created_at: Date;
  updated_at: Date;
}

export interface Scene {
  id: string;
  episode_id: string;
  scene_number: number;
  location: string | null;
  time_of_day: string | null;
  description: string | null;
  dialogue: string | null;
  duration_seconds: number | null;
  video_url: string | null;
  veo_generation_id: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// Database utilities
export const db = {
  // User queries
  async getUserById(id: string): Promise<User | null> {
    const [user] = await sql<User[]>`SELECT * FROM users WHERE id = ${id}`;
    return user || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await sql<User[]>`SELECT * FROM users WHERE email = ${email}`;
    return user || null;
  },

  async createUser(email: string, passwordHash: string, name?: string): Promise<User> {
    const [user] = await sql<User[]>`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name || null})
      RETURNING *
    `;
    return user;
  },

  // Series queries
  async getSeriesByUserId(userId: string): Promise<Series[]> {
    return await sql<Series[]>`
      SELECT * FROM series
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  },

  async getSeriesById(id: string): Promise<Series | null> {
    const [series] = await sql<Series[]>`SELECT * FROM series WHERE id = ${id}`;
    return series || null;
  },

  async createSeries(data: {
    user_id: string;
    title: string;
    description?: string;
    genre?: string;
    tone?: string;
    target_audience?: string;
  }): Promise<Series> {
    const [series] = await sql<Series[]>`
      INSERT INTO series ${sql(data)}
      RETURNING *
    `;
    return series;
  },

  // Episode queries
  async getEpisodesBySeriesId(seriesId: string): Promise<Episode[]> {
    return await sql<Episode[]>`
      SELECT * FROM episodes
      WHERE series_id = ${seriesId}
      ORDER BY episode_number DESC
    `;
  },

  async getEpisodeById(id: string): Promise<Episode | null> {
    const [episode] = await sql<Episode[]>`SELECT * FROM episodes WHERE id = ${id}`;
    return episode || null;
  },

  async createEpisode(data: {
    series_id: string;
    episode_number: number;
    title: string;
    synopsis?: string;
    script?: string;
  }): Promise<Episode> {
    const [episode] = await sql<Episode[]>`
      INSERT INTO episodes ${sql(data)}
      RETURNING *
    `;
    return episode;
  },

  async updateEpisodeStatus(id: string, status: string): Promise<Episode> {
    const [episode] = await sql<Episode[]>`
      UPDATE episodes
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return episode;
  },

  // Scene queries
  async getScenesByEpisodeId(episodeId: string): Promise<Scene[]> {
    return await sql<Scene[]>`
      SELECT * FROM scenes
      WHERE episode_id = ${episodeId}
      ORDER BY scene_number ASC
    `;
  },

  async createScene(data: {
    episode_id: string;
    scene_number: number;
    location?: string;
    description?: string;
    dialogue?: string;
  }): Promise<Scene> {
    const [scene] = await sql<Scene[]>`
      INSERT INTO scenes ${sql(data)}
      RETURNING *
    `;
    return scene;
  },

  // Analytics
  async recordAuditLog(data: {
    user_id?: string;
    action: string;
    resource_type?: string;
    resource_id?: string;
    metadata?: object;
  }): Promise<void> {
    await sql`
      INSERT INTO audit_logs ${sql(data)}
    `;
  },

  // Generic pg-compatible query adapter for new API routes
  async query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }> {
    const result = await sql.unsafe(text, params as never[]);
    return { rows: result as Record<string, unknown>[] };
  },
};

export default sql;
