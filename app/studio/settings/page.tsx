'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { PAYMENT_CONFIGS, type PaymentMethodType } from '@/lib/payments';
import type { PaymentMethod } from '@/lib/types';

// ── Schemas ──────────────────────────────────────────────────
const paymentMethodSchema = z.object({
  method_type: z.enum(['paypal', 'cashapp', 'venmo', 'zelle', 'chime']),
  handle: z.string().min(1, 'Handle is required').max(200),
  display_name: z.string().max(100).optional(),
  is_primary: z.boolean().optional(),
});

const streamConfigSchema = z.object({
  buy_me_coffee_user_key: z.string().max(100).optional(),
  social_stream_youtube_id: z.string().max(100).optional(),
  social_stream_twitch: z.string().max(100).optional(),
  evmux_default_room: z.string().max(200).optional(),
  meshcast_enabled: z.boolean().optional(),
});

type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;
type StreamConfigForm = z.infer<typeof streamConfigSchema>;

// ── Sub-components ──────────────────────────────────────────
function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-white font-bold text-lg">{title}</h2>
      {desc && <p className="text-gray-400 text-sm mt-0.5">{desc}</p>}
    </div>
  );
}

function PaymentMethodCard({
  method,
  onDelete,
  onSetPrimary,
}: {
  method: PaymentMethod;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
}) {
  const config = PAYMENT_CONFIGS[method.method_type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3 border border-gray-700"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: config.color }}
      >
        {config.handlePrefix || method.method_type[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{config.name}</p>
        <p className="text-gray-400 text-xs truncate">{method.handle}</p>
      </div>
      {method.is_primary && (
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">Primary</span>
      )}
      <div className="flex gap-1 flex-shrink-0">
        {!method.is_primary && (
          <button
            onClick={() => onSetPrimary(method.id)}
            className="text-gray-500 hover:text-blue-400 text-xs px-2 py-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Set primary
          </button>
        )}
        <button
          onClick={() => onDelete(method.id)}
          className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          title="Remove"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────
type Tab = 'payments' | 'streaming' | 'account';

export default function SettingsPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('payments');
  const [showAddPayment, setShowAddPayment] = useState(false);

  const authHeader = { Authorization: `Bearer ${token}` };

  // Queries
  const { data: paymentMethods = [], refetch: refetchMethods } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/payments/methods', { headers: authHeader });
      const data = await res.json();
      return (data.methods || []) as PaymentMethod[];
    },
    enabled: !!token,
  });

  // Mutations
  const addMethodMutation = useMutation({
    mutationFn: async (data: PaymentMethodForm) => {
      const res = await fetch('/api/payments/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      refetchMethods();
      setShowAddPayment(false);
      methodForm.reset();
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/payments/methods?id=${id}`, { method: 'DELETE', headers: authHeader });
    },
    onSuccess: () => refetchMethods(),
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      const method = paymentMethods.find((m) => m.id === id);
      if (!method) return;
      await fetch('/api/payments/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ method_type: method.method_type, handle: method.handle, is_primary: true }),
      });
    },
    onSuccess: () => refetchMethods(),
  });

  // Forms
  const methodForm = useForm<PaymentMethodForm>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { method_type: 'cashapp', is_primary: false },
  });

  const streamForm = useForm<StreamConfigForm>({
    resolver: zodResolver(streamConfigSchema),
    defaultValues: {
      buy_me_coffee_user_key: '42413ab8b4066661c7734270e3057ce0',
      meshcast_enabled: true,
    },
  });

  const selectedMethodType = methodForm.watch('method_type') as PaymentMethodType;

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'payments', label: 'Payments', icon: '💸' },
    { id: 'streaming', label: 'Streaming', icon: '📡' },
    { id: 'account', label: 'Account', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <a href="/studio" className="text-gray-400 hover:text-white transition-colors text-sm">← Studio</a>
          <span className="text-gray-700">/</span>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-6 border border-gray-700">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── PAYMENTS TAB ── */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <SectionHeader
                title="Direct Payment Methods"
                desc="Add your payment handles. Fans pay you directly — 90% creator revenue, no virtual currency."
              />

              <AnimatePresence>
                {paymentMethods.map((m) => (
                  <div key={m.id} className="mb-2">
                    <PaymentMethodCard
                      method={m}
                      onDelete={(id) => deleteMethodMutation.mutate(id)}
                      onSetPrimary={(id) => setPrimaryMutation.mutate(id)}
                    />
                  </div>
                ))}
              </AnimatePresence>

              {paymentMethods.length === 0 && !showAddPayment && (
                <p className="text-gray-500 text-sm text-center py-4 mb-3">
                  No payment methods added yet. Add your Cash App, PayPal, Venmo, Zelle, or Chime.
                </p>
              )}

              {/* Add payment form */}
              <AnimatePresence>
                {showAddPayment && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={methodForm.handleSubmit((d) => addMethodMutation.mutate(d))}
                    className="bg-gray-800 rounded-xl p-4 mt-3 space-y-3"
                  >
                    {/* Method type */}
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Payment App</label>
                      <div className="grid grid-cols-5 gap-2">
                        {(Object.keys(PAYMENT_CONFIGS) as PaymentMethodType[]).map((type) => {
                          const cfg = PAYMENT_CONFIGS[type];
                          const isSelected = selectedMethodType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => methodForm.setValue('method_type', type)}
                              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                                isSelected ? 'border-transparent' : 'border-gray-600'
                              }`}
                              style={isSelected ? { backgroundColor: cfg.color + '20', borderColor: cfg.color } : {}}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: cfg.color }}
                              >
                                {cfg.handlePrefix || type[0].toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-400">{cfg.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Handle */}
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">
                        Your {PAYMENT_CONFIGS[selectedMethodType]?.name} Handle
                      </label>
                      <input
                        {...methodForm.register('handle')}
                        placeholder={PAYMENT_CONFIGS[selectedMethodType]?.handleExample || 'Enter handle'}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                      />
                      {methodForm.formState.errors.handle && (
                        <p className="text-red-400 text-xs mt-1">{methodForm.formState.errors.handle.message}</p>
                      )}
                    </div>

                    {/* Display name */}
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Display Name (optional)</label>
                      <input
                        {...methodForm.register('display_name')}
                        placeholder="e.g. My PayPal"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Primary */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...methodForm.register('is_primary')} className="rounded" />
                      <span className="text-gray-300 text-sm">Set as primary payment method</span>
                    </label>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={addMethodMutation.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                      >
                        {addMethodMutation.isPending ? 'Saving...' : 'Add Method'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPayment(false)}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {!showAddPayment && (
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="mt-3 w-full border-2 border-dashed border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  + Add Payment Method
                </button>
              )}
            </div>

            {/* Fee info */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
              <p className="text-green-400 font-semibold text-sm mb-1">90% Creator Revenue Model</p>
              <p className="text-gray-400 text-sm">
                Fans pay you directly via PayPal, Cash App, Venmo, Zelle, or Chime.
                You receive 90% of every payment. No gifts, no virtual coins, no bullshit.
              </p>
            </div>
          </div>
        )}

        {/* ── STREAMING TAB ── */}
        {activeTab === 'streaming' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <SectionHeader
                title="Buy Me a Coffee"
                desc="Get stream alerts when supporters send you coffee during live sessions."
              />
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Your BMC User Key</label>
                <input
                  {...streamForm.register('buy_me_coffee_user_key')}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-blue-500 focus:outline-none"
                  placeholder="42413ab8b4066661c7734270e3057ce0"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href="https://studio.buymeacoffee.com/stream-alert/page/evmux?user_key=42413ab8b4066661c7734270e3057ce0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/20 transition-colors"
                >
                  ☕ evmux Overlay URL
                </a>
                <a
                  href={`https://studio.buymeacoffee.com/stream-alert?user_key=42413ab8b4066661c7734270e3057ce0`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  OBS Overlay URL
                </a>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <SectionHeader
                title="Social Stream Ninja"
                desc="Consolidate chat from YouTube, Twitch, TikTok, Instagram into one feed."
              />
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">YouTube Channel ID</label>
                  <input
                    {...streamForm.register('social_stream_youtube_id')}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="UCxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Twitch Channel</label>
                  <input
                    {...streamForm.register('social_stream_twitch')}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="yourchannelname"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <SectionHeader
                title="evmux Configuration"
                desc="Your live Domino Entertainment broadcasting setup."
              />
              <div className="space-y-2 text-sm">
                {[
                  { label: 'RTMP URL', value: 'rtmp://rtmp1.us-east-1.evmux.com/live' },
                  { label: 'App ID', value: 'app-b6zHr3-35539f7e-1450-4412-9c6e-0372cd9bcbba' },
                  { label: 'Console', value: 'console.evmux.com/editor/3491/244617' },
                  { label: 'Guest Portal', value: 'console.evmux.com/guest/9ql-0vvq-hsm' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-3 bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-xs flex-shrink-0">{label}</span>
                    <span className="text-gray-200 text-xs font-mono truncate">{value}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(value)}
                      className="text-gray-500 hover:text-blue-400 flex-shrink-0 transition-colors"
                      title="Copy"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <a
                  href="https://console.evmux.com/editor/3491/244617"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Open evmux Console →
                </a>
                <a
                  href="https://console.evmux.com/guest/9ql-0vvq-hsm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  Guest Portal →
                </a>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <SectionHeader
                title="VDO.ninja Quick Links"
                desc="Your live Domino Entertainment streaming URLs."
              />
              <div className="space-y-2">
                {[
                  { label: 'Room: SwanyThree (Solo)', url: 'https://vdo.ninja/?view=6EcRB3QE&room=SwanyThree&solo' },
                  { label: 'DominoDynasty Scene', url: 'https://vdo.ninja/?v=SwanyThree&r=Domino&scn' },
                  { label: 'Guest Share Link', url: 'https://vdo.ninja/?v=xaUagnuH' },
                ].map(({ label, url }) => (
                  <div key={url} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-xs flex-1">{label}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex-shrink-0 transition-colors"
                    >
                      Open ↗
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(url)}
                      className="text-gray-500 hover:text-blue-400 flex-shrink-0 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'account' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <SectionHeader title="Account" desc="Your Domino Entertainment account details." />
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-0.5">Email</p>
                <p className="text-white font-medium">{user?.email || 'Not signed in'}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-0.5">Username</p>
                <p className="text-white font-medium">{user?.username || '—'}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-0.5">Plan</p>
                <p className="text-white font-medium capitalize">{user?.subscription_tier || 'free'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
