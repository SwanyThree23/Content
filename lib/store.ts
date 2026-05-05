// Zustand v5 global state store

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  User,
  LiveSession,
  LiveSessionGuest,
  ChatMessage,
  StreamAlert,
  PaymentMethod,
  LayoutType,
} from './types';

// ============================================================
// AUTH STORE
// ============================================================
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        setUser: (user, token) => set({ user, token, isAuthenticated: true }),
        clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      }),
      { name: 'auth-store' }
    )
  )
);

// ============================================================
// LIVE SESSION STORE
// ============================================================
interface LiveSessionState {
  session: LiveSession | null;
  guests: LiveSessionGuest[];
  chatMessages: ChatMessage[];
  alerts: StreamAlert[];
  viewerCount: number;
  layoutType: LayoutType;
  expandedPanel: number | null;   // panel_slot that is Bigo-expanded
  featuredPanel: number | null;
  isBroadcasting: boolean;
  isRecording: boolean;
  paymentMethods: PaymentMethod[];

  setSession: (session: LiveSession | null) => void;
  setGuests: (guests: LiveSessionGuest[]) => void;
  updateGuest: (slot: number, updates: Partial<LiveSessionGuest>) => void;
  addGuest: (guest: LiveSessionGuest) => void;
  removeGuest: (slot: number) => void;
  expandPanel: (slot: number | null) => void;
  featurePanel: (slot: number | null) => void;
  setLayout: (layout: LayoutType) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  addAlert: (alert: StreamAlert) => void;
  dismissAlert: (id: string) => void;
  setViewerCount: (count: number) => void;
  setBroadcasting: (val: boolean) => void;
  setRecording: (val: boolean) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
}

export const useLiveSessionStore = create<LiveSessionState>()(
  devtools(
    (set) => ({
      session: null,
      guests: [],
      chatMessages: [],
      alerts: [],
      viewerCount: 0,
      layoutType: 'grid',
      expandedPanel: null,
      featuredPanel: null,
      isBroadcasting: false,
      isRecording: false,
      paymentMethods: [],

      setSession: (session) => set({ session }),
      setGuests: (guests) => set({ guests }),
      updateGuest: (slot, updates) =>
        set((state) => ({
          guests: state.guests.map((g) =>
            g.panel_slot === slot ? { ...g, ...updates } : g
          ),
        })),
      addGuest: (guest) =>
        set((state) => ({ guests: [...state.guests, guest] })),
      removeGuest: (slot) =>
        set((state) => ({
          guests: state.guests.filter((g) => g.panel_slot !== slot),
        })),
      expandPanel: (slot) => set({ expandedPanel: slot }),
      featurePanel: (slot) => set({ featuredPanel: slot }),
      setLayout: (layoutType) => set({ layoutType }),
      addChatMessage: (msg) =>
        set((state) => ({
          chatMessages: [...state.chatMessages.slice(-200), msg],
        })),
      clearChat: () => set({ chatMessages: [] }),
      addAlert: (alert) =>
        set((state) => ({ alerts: [...state.alerts, alert] })),
      dismissAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),
      setViewerCount: (viewerCount) => set({ viewerCount }),
      setBroadcasting: (isBroadcasting) => set({ isBroadcasting }),
      setRecording: (isRecording) => set({ isRecording }),
      setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
    })
  )
);

// ============================================================
// STUDIO STORE (episode creation, AI generation)
// ============================================================
interface StudioState {
  activeSeries: string | null;
  activeEpisode: string | null;
  generationStatus: 'idle' | 'generating' | 'processing' | 'done' | 'error';
  generationProgress: number;
  generationMessage: string;

  setActiveSeries: (id: string | null) => void;
  setActiveEpisode: (id: string | null) => void;
  setGenerationStatus: (status: StudioState['generationStatus'], message?: string) => void;
  setGenerationProgress: (progress: number) => void;
  resetGeneration: () => void;
}

export const useStudioStore = create<StudioState>()(
  devtools(
    (set) => ({
      activeSeries: null,
      activeEpisode: null,
      generationStatus: 'idle',
      generationProgress: 0,
      generationMessage: '',

      setActiveSeries: (activeSeries) => set({ activeSeries }),
      setActiveEpisode: (activeEpisode) => set({ activeEpisode }),
      setGenerationStatus: (generationStatus, generationMessage = '') =>
        set({ generationStatus, generationMessage }),
      setGenerationProgress: (generationProgress) => set({ generationProgress }),
      resetGeneration: () =>
        set({ generationStatus: 'idle', generationProgress: 0, generationMessage: '' }),
    })
  )
);
