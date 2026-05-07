// PocketBase integration - lightweight backend alternative to PostgreSQL/Railway
// Use when you need a self-hosted, file-based backend (great for demos/solo dev)
// PocketBase URL: set POCKETBASE_URL in environment

export const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';

interface PbRecord {
  id: string;
  created: string;
  updated: string;
  [key: string]: unknown;
}

interface PbListResult<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

class PocketBaseClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setToken(token: string) {
    this.authToken = token;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken ? { Authorization: this.authToken } : {}),
      ...extra,
    };
  }

  async list<T extends PbRecord>(
    collection: string,
    options: { page?: number; perPage?: number; filter?: string; sort?: string } = {}
  ): Promise<PbListResult<T>> {
    const params = new URLSearchParams({
      page: String(options.page || 1),
      perPage: String(options.perPage || 50),
      ...(options.filter ? { filter: options.filter } : {}),
      ...(options.sort ? { sort: options.sort } : {}),
    });
    const res = await fetch(`${this.baseUrl}/api/collections/${collection}/records?${params}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`PocketBase list failed: ${res.status}`);
    return res.json();
  }

  async getOne<T extends PbRecord>(collection: string, id: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api/collections/${collection}/records/${id}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`PocketBase getOne failed: ${res.status}`);
    return res.json();
  }

  async create<T extends PbRecord>(collection: string, data: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api/collections/${collection}/records`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`PocketBase create failed: ${res.status}`);
    return res.json();
  }

  async update<T extends PbRecord>(
    collection: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api/collections/${collection}/records/${id}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`PocketBase update failed: ${res.status}`);
    return res.json();
  }

  async delete(collection: string, id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/collections/${collection}/records/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`PocketBase delete failed: ${res.status}`);
  }

  async authWithPassword(collection: string, email: string, password: string) {
    const res = await fetch(
      `${this.baseUrl}/api/collections/${collection}/auth-with-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      }
    );
    if (!res.ok) throw new Error('PocketBase auth failed');
    const data = await res.json();
    this.authToken = data.token;
    return data as { token: string; record: PbRecord };
  }

  // Realtime subscription via SSE
  subscribeToCollection(
    collection: string,
    recordId: string | '*',
    callback: (event: { action: string; record: PbRecord }) => void
  ): () => void {
    const url = `${this.baseUrl}/api/realtime`;
    const sse = new EventSource(url);

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.collection === collection) callback(data);
      } catch { /* ignore */ }
    };

    // Subscribe
    fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ subscriptions: [`${collection}/${recordId}`] }),
    }).catch(() => null);

    return () => sse.close();
  }
}

export const pb = new PocketBaseClient(POCKETBASE_URL);

// PocketBase collection schemas for reference:
// users: { email, username, name, avatar, subscription_tier }
// series: { user (relation), title, description, genre, status }
// episodes: { series (relation), episode_number, title, synopsis, script, status }
// live_sessions: { host (relation), title, is_active, vdo_room_id, direct_payments_enabled }
// payment_methods: { user (relation), method_type, handle, is_primary }
// video_posts: { creator (relation), title, duration_seconds, is_paywalled, paywall_price_cents }
