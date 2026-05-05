'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLiveSessionStore, useAuthStore } from '@/lib/store';
import type { LiveSession, ApiResponse } from '@/lib/types';

async function apiFetch<T>(url: string, options?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useLiveSession(sessionId: string | null) {
  const { token } = useAuthStore();
  const { setSession, setGuests } = useLiveSessionStore();

  return useQuery({
    queryKey: ['live-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const data = await apiFetch<ApiResponse<LiveSession>>(
        `/api/streaming/sessions/${sessionId}`,
        undefined,
        token || undefined
      );
      if (data.data) {
        setSession(data.data);
      }
      return data.data;
    },
    enabled: !!sessionId && !!token,
    refetchInterval: 5000,   // poll every 5s for live updates
  });
}

export function useCreateSession() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { setSession } = useLiveSessionStore();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      session_type?: 'video' | 'audio' | 'screen';
      max_guests?: number;
      is_private?: boolean;
      series_id?: string;
    }) => {
      return apiFetch<ApiResponse<LiveSession>>(
        '/api/streaming/create-room',
        { method: 'POST', body: JSON.stringify(payload) },
        token || undefined
      );
    },
    onSuccess: (data) => {
      if (data.data) {
        setSession(data.data);
        queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
      }
    },
  });
}

export function usePaymentMethods(userId?: string) {
  const { token } = useAuthStore();
  const { setPaymentMethods } = useLiveSessionStore();

  return useQuery({
    queryKey: ['payment-methods', userId],
    queryFn: async () => {
      const data = await apiFetch<{ methods: import('@/lib/types').PaymentMethod[] }>(
        '/api/payments/methods',
        undefined,
        token || undefined
      );
      setPaymentMethods(data.methods);
      return data.methods;
    },
    enabled: !!userId && !!token,
  });
}
