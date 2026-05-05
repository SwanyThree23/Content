'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveSessionStore } from '@/lib/store';
import { LivePanel } from './LivePanel';
import type { LayoutType } from '@/lib/types';

// Grid configs: columns per guest count
const GRID_CONFIGS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2',
  5: 'grid-cols-3',
  6: 'grid-cols-3',
  7: 'grid-cols-4',
  8: 'grid-cols-4',
  9: 'grid-cols-3',
  10: 'grid-cols-4',
  11: 'grid-cols-4',
  12: 'grid-cols-4',
};

interface LayoutSelectorProps {
  current: LayoutType;
  onChange: (layout: LayoutType) => void;
}

function LayoutSelector({ current, onChange }: LayoutSelectorProps) {
  const layouts: { type: LayoutType; label: string }[] = [
    { type: 'grid', label: 'Grid' },
    { type: 'spotlight', label: 'Spotlight' },
    { type: 'sidebar', label: 'Sidebar' },
    { type: 'bigo', label: 'Bigo' },
    { type: 'theater', label: 'Theater' },
  ];

  return (
    <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
      {layouts.map(({ type, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            current === type
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SpotlightLayout() {
  const { guests, featuredPanel } = useLiveSessionStore();
  const featured = guests.find((g) => g.panel_slot === featuredPanel) || guests[0];
  const others = guests.filter((g) => g.panel_slot !== featured?.panel_slot);

  return (
    <div className="flex gap-2 h-full">
      {/* Main featured panel */}
      <div className="flex-1 min-h-0">
        {featured && <LivePanel guest={featured} />}
      </div>
      {/* Side strip */}
      {others.length > 0 && (
        <div className="w-48 flex flex-col gap-2 overflow-y-auto">
          {others.map((g) => (
            <div key={g.id} className="h-28 flex-shrink-0">
              <LivePanel guest={g} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BigoLayout() {
  const { guests, expandedPanel } = useLiveSessionStore();
  const host = guests[0];
  const expanded = expandedPanel ? guests.find((g) => g.panel_slot === expandedPanel) : null;
  const others = guests.filter((g) => g !== host);

  return (
    <div className="relative h-full">
      {/* Full-background host or expanded panel */}
      {host && (
        <div className="absolute inset-0">
          <LivePanel guest={expanded || host} />
        </div>
      )}
      {/* Floating mini panels in bottom-right Bigo style */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {others.slice(0, 4).map((g) => (
          <div key={g.id} className="w-28 h-20 rounded-lg overflow-hidden shadow-lg">
            <LivePanel guest={g} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TheaterLayout() {
  const { guests } = useLiveSessionStore();
  const [main, ...rest] = guests;

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex-1 min-h-0">
        {main && <LivePanel guest={main} />}
      </div>
      {rest.length > 0 && (
        <div className="flex gap-2 h-24">
          {rest.map((g) => (
            <div key={g.id} className="flex-1">
              <LivePanel guest={g} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GridLayout() {
  const { guests } = useLiveSessionStore();
  const cols = GRID_CONFIGS[guests.length] || 'grid-cols-3';

  return (
    <div className={`grid ${cols} gap-2 h-full auto-rows-fr`}>
      <AnimatePresence>
        {guests.map((guest) => (
          <motion.div
            key={guest.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <LivePanel guest={guest} />
          </motion.div>
        ))}
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 1 - guests.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center"
          >
            <span className="text-gray-500 text-sm">+ Add Guest</span>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function PanelGrid() {
  const { layoutType, setLayout, guests, session } = useLiveSessionStore();

  const LayoutComponent = useMemo(() => {
    switch (layoutType) {
      case 'spotlight': return SpotlightLayout;
      case 'bigo': return BigoLayout;
      case 'theater': return TheaterLayout;
      default: return GridLayout;
    }
  }, [layoutType]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Layout controls */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-sm">
            {guests.length} / {session?.max_guests || 9} guests
          </span>
          <LayoutSelector current={layoutType} onChange={setLayout} />
        </div>
      </div>
      {/* Panel area */}
      <div className="flex-1 min-h-0 relative">
        <LayoutComponent />
      </div>
    </div>
  );
}
