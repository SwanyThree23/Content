'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Animated wave bar (matches Domino Entertainment brand color #068deb)
function WaveBar({ index }: { index: number }) {
  return (
    <motion.div
      className="w-1 rounded-full"
      style={{ backgroundColor: '#068deb' }}
      animate={{ height: [6, 28, 6] }}
      transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.12, ease: 'easeInOut' }}
    />
  );
}

function DominoLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-0.5 h-8">
        {Array.from({ length: 7 }).map((_, i) => <WaveBar key={i} index={i} />)}
      </div>
      <span className="font-black text-2xl tracking-tight text-white">
        DOMINO<span style={{ color: '#068deb' }}>.</span>
      </span>
    </div>
  );
}

const FEATURES = [
  {
    icon: '📡',
    title: 'Live Studio',
    desc: '9+ guest panels, Bigo-style expandable, 5 layout modes. Go live in seconds.',
    color: 'from-red-500 to-orange-500',
    href: '/studio/live-studio',
  },
  {
    icon: '💸',
    title: 'Direct Payments',
    desc: 'PayPal, Cash App, Venmo, Zelle, Chime. 90% goes to creators. No gifts, no coins.',
    color: 'from-green-500 to-emerald-500',
    href: '/studio/live-studio',
  },
  {
    icon: '🎬',
    title: 'AI Episode Generation',
    desc: 'Claude generates complete scripts with scenes, dialogue, and visual prompts.',
    color: 'from-purple-500 to-violet-500',
    href: '/studio',
  },
  {
    icon: '🎥',
    title: 'Veo 3 Video',
    desc: 'Google Veo 3 generates cinematic video clips from AI scripts automatically.',
    color: 'from-blue-500 to-indigo-500',
    href: '/studio',
  },
  {
    icon: '📺',
    title: 'Pro Broadcast',
    desc: 'evmux RTMP to YouTube, Twitch, and 30+ platforms simultaneously.',
    color: 'from-yellow-500 to-amber-500',
    href: '/studio/professional-broadcast',
  },
  {
    icon: '💬',
    title: 'Unified Chat',
    desc: 'Social Stream Ninja consolidates YouTube, Twitch, TikTok, Instagram chat in one feed.',
    color: 'from-pink-500 to-rose-500',
    href: '/studio/live-studio',
  },
  {
    icon: '☕',
    title: 'Stream Alerts',
    desc: 'Buy Me a Coffee alerts with animated overlays built into your live studio.',
    color: 'from-amber-500 to-orange-500',
    href: '/studio/live-studio',
  },
  {
    icon: '🔗',
    title: 'Social Sharing',
    desc: 'Share to Instagram, Facebook, TikTok, Snapchat, YouTube with one click.',
    color: 'from-cyan-500 to-blue-500',
    href: '/studio/video-posts',
  },
  {
    icon: '🤖',
    title: 'N8N Automation',
    desc: 'Scheduled episodes → AI generation → video → YouTube publishing, fully automated.',
    color: 'from-gray-500 to-slate-500',
    href: '/studio',
  },
];

const STATS = [
  { value: '9+', label: 'Live Guest Panels' },
  { value: '90%', label: 'Creator Revenue' },
  { value: '5', label: 'Payment Methods' },
  { value: '30+', label: 'Broadcast Platforms' },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      <Link href={feature.href}>
        <div className="group bg-gray-900/60 border border-gray-700 hover:border-gray-500 rounded-2xl p-6 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
            {feature.icon}
          </div>
          <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function TypewriterText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < current.length) {
          setDisplayed(current.slice(0, displayed.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1));
        } else {
          setIsDeleting(false);
          setIndex((i) => (i + 1) % texts.length);
        }
      }
    }, isDeleting ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index, texts]);

  return (
    <span>
      {displayed}
      <span className="animate-pulse" style={{ color: '#068deb' }}>|</span>
    </span>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <DominoLogo />
          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-3 py-1.5"
            >
              Dashboard
            </Link>
            <Link
              href="/studio/live-studio"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: '#068deb' }}
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Go Live
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.div
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-16"
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(6,141,235,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,141,235,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(6,141,235,0.15) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* Wave logo large */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-end gap-1 h-16">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 rounded-full"
                  style={{ backgroundColor: '#068deb' }}
                  animate={{ height: [8, 48, 8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <span className="text-white">DOMINO</span>
            <br />
            <span style={{ color: '#068deb' }}>ENTERTAINMENT</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-4 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            AI Soap Opera Studio
          </motion.p>

          <motion.div
            className="text-lg text-gray-400 mb-10 h-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <TypewriterText texts={[
              'Go live with 9+ guests',
              'Direct payments — 90% to creators',
              'AI generates your episodes',
              'Broadcast to 30+ platforms',
              'No gifts. No coins. Just cash.',
            ]} />
          </motion.div>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Link
              href="/studio/live-studio"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl"
              style={{ backgroundColor: '#068deb' }}
            >
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              Launch Live Studio
            </Link>
            <Link
              href="/studio"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-gray-800 hover:bg-gray-700 transition-all hover:scale-105 border border-gray-600"
            >
              Studio Dashboard →
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-gray-900/60 border border-gray-700 rounded-xl py-4 px-3 text-center">
                <p className="text-3xl font-black" style={{ color: '#068deb' }}>{value}</p>
                <p className="text-gray-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs">scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </motion.div>
      </motion.div>

      {/* Features grid */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              One platform. Live studio, AI content, direct monetization, and professional broadcasting.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* Live Studio showcase */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Fake studio preview */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-bold">LIVE</span>
                </div>
                <span className="text-gray-300 text-sm">Domino Entertainment Live</span>
                <span className="text-gray-500 text-sm">👁 1,247 viewers</span>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg">💸 Tip Creator</div>
                <div className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-lg">☕ Alerts</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-black aspect-video max-h-80">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `hsl(${i * 40}, 40%, 15%)` }}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 mx-auto mb-1 flex items-center justify-center text-sm">
                        {['🎭', '👑', '💅', '🎬', '🌟', '💋', '🎪', '🎨', '✨'][i]}
                      </div>
                      <p className="text-gray-400 text-xs">Guest {i + 1}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-300 text-lg font-semibold mb-2">
                9-panel live studio with direct payments built in
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Bigo-style expandable panels · 5 layouts · Social Stream Ninja chat · BMC alerts
              </p>
              <Link
                href="/studio/live-studio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{ backgroundColor: '#068deb' }}
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Go Live Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment methods */}
      <section className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-white mb-3">
              Fuck Gifts. Get Paid <span style={{ color: '#068deb' }}>Directly.</span>
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              No virtual coins. No platform middlemen. Fans pay you directly via real money apps.
              You keep 90%.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {[
              { name: 'PayPal', color: '#0070ba', prefix: '' },
              { name: 'Cash App', color: '#00d632', prefix: '$' },
              { name: 'Venmo', color: '#3d95ce', prefix: '@' },
              { name: 'Zelle', color: '#6d1ed4', prefix: '' },
              { name: 'Chime', color: '#1ec677', prefix: '' },
            ].map(({ name, color, prefix }) => (
              <motion.div
                key={name}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-4 text-center"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-black text-xl"
                  style={{ backgroundColor: color }}
                >
                  {prefix || name[0]}
                </div>
                <p className="text-white font-semibold text-sm">{name}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm mx-auto">
            <p className="text-gray-400 text-sm mb-2">Fan sends $10 via Cash App</p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">Creator receives (90%)</span>
              <span className="text-green-400 font-bold">$9.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">Platform (10%)</span>
              <span className="text-gray-500 text-xs">$1.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* VDO.ninja + evmux pipeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl font-black text-white text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Production Pipeline
          </motion.h2>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {[
              { label: 'Actors', icon: '🎭', sub: 'VDO.ninja WebRTC' },
              { icon: '→', label: '', sub: '' },
              { label: 'Live Mix', icon: '🎛️', sub: 'evmux studio' },
              { icon: '→', label: '', sub: '' },
              { label: 'RTMP Out', icon: '📡', sub: 'YouTube / Twitch' },
              { icon: '→', label: '', sub: '' },
              { label: 'AI Edit', icon: '🤖', sub: 'Auto-publish' },
            ].map((item, i) => (
              item.icon === '→' ? (
                <div key={i} className="text-gray-600 text-2xl font-bold">→</div>
              ) : (
                <motion.div
                  key={item.label}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-5 text-center min-w-28"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.sub}</p>
                </motion.div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-6">
            <div className="flex items-end gap-0.5 h-10">
              {Array.from({ length: 9 }).map((_, i) => <WaveBar key={i} index={i} />)}
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-4">Ready to Go Live?</h2>
          <p className="text-gray-400 text-lg mb-8">
            Domino Entertainment is live now. Launch your studio and start creating.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/studio/live-studio"
              className="px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#068deb' }}
            >
              🔴 Go Live
            </Link>
            <Link
              href="/studio"
              className="px-8 py-4 rounded-2xl font-bold text-lg bg-gray-800 hover:bg-gray-700 transition-all hover:scale-105 border border-gray-700"
            >
              Open Studio
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center">
        <div className="flex justify-center mb-4">
          <DominoLogo />
        </div>
        <p className="text-gray-500 text-sm">
          AI Soap Opera Studio · Powered by Claude + Veo 3 + VDO.ninja + evmux
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <a href="https://console.evmux.com/editor/3491/244617" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">evmux Console</a>
          <a href="https://vdo.ninja/?view=6EcRB3QE&room=SwanyThree&solo" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">VDO.ninja</a>
          <a href="https://studio.buymeacoffee.com/stream-alert/page/evmux?user_key=42413ab8b4066661c7734270e3057ce0" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">BMC Alerts</a>
        </div>
      </footer>
    </div>
  );
}
