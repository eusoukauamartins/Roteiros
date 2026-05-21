// =============================================
// OTIMIZADOR — SISTEMA DE PALETAS PREMIUM
// =============================================
// Visual philosophy:
// - Cinematic, atmospheric, premium
// - Rich dark surfaces with visible layer separation
// - Text always highly readable (off-white / warm grays)
// - Accents are elegant, never aggressive
// - Surfaces use visible luminance separation
// =============================================

// Neutral text — shared by ALL palettes
// Based on: #F5F7FA / #B6BDC9 / #7C8594 hierarchy
const NEUTRAL_TEXT_DARK = {
  '--text-primary': '#FFFFFF',       // pure white, maximum readability
  '--text-secondary': '#E2E8F0',     // light slate-200 — very bright secondary
  '--text-muted': '#A1A1AA',         // zinc-400 — much clearer muted text for labels/helpers
};

const NEUTRAL_TEXT_LIGHT = {
  '--text-primary': '#1A1A1F',
  '--text-secondary': '#4B5563',
  '--text-muted': '#6B7280',
};

export const palettes = {
  'lyria-dark': {
    name: 'Paleta Lyria',
    dark: {
      '--bg-primary': '#0F1117', '--bg-secondary': '#1A1F2B',
      '--accent': '#4D8DFF', '--accent-light': '#6AA2FF',
      '--accent-surface': 'rgba(77, 141, 255, 0.12)',
      '--surface': '#252C3D', '--surface-hover': '#2A3144',
      '--surface-active': '#2A3144',
      '--border-color': '#2F384D',
      '--text-primary': '#F3F6FC', '--text-secondary': '#C8D0E0', '--text-muted': '#7E8AA3',
      '--glow': 'rgba(77, 141, 255, 0.3)',
      '--gradient-start': '#4D8DFF', '--gradient-end': '#00cec9',
    },
    light: {
      '--bg-primary': '#F8FAFC', '--bg-secondary': '#F1F5F9',
      '--accent': '#4D8DFF', '--accent-light': '#6AA2FF',
      '--accent-surface': 'rgba(77, 141, 255, 0.12)',
      '--surface': '#E2E8F0', '--surface-hover': '#CBD5E1',
      '--surface-active': '#CBD5E1',
      '--border-color': '#CBD5E1',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(77, 141, 255, 0.2)',
      '--gradient-start': '#4D8DFF', '--gradient-end': '#00cec9',
    },
  },

  'midnight-purple': {
    name: 'Midnight Purple',
    dark: {
      '--bg-primary': '#0F0B1A', '--bg-secondary': '#1A1328',
      '--accent': '#8B5CF6', '--accent-light': '#A78BFA',
      '--accent-surface': 'rgba(139,92,246,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(139,92,246,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(139,92,246,0.20)',
      '--gradient-start': '#7C3AED', '--gradient-end': '#A78BFA',
    },
    light: {
      '--bg-primary': '#F8F7FF', '--bg-secondary': '#EEEAFF',
      '--accent': '#7C3AED', '--accent-light': '#8B5CF6',
      '--accent-surface': 'rgba(124,58,237,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(124,58,237,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(124,58,237,0.12)',
      '--gradient-start': '#7C3AED', '--gradient-end': '#A78BFA',
    },
  },

  'obsidian-gold': {
    name: 'Obsidian Gold',
    dark: {
      '--bg-primary': '#0D0B08', '--bg-secondary': '#1A1610',
      '--accent': '#D4A84B', '--accent-light': '#E8C56A',
      '--accent-surface': 'rgba(212,168,75,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(212,168,75,0.12)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(212,168,75,0.20)',
      '--gradient-start': '#B8942E', '--gradient-end': '#E8C56A',
    },
    light: {
      '--bg-primary': '#FFFCF5', '--bg-secondary': '#FFF8E8',
      '--accent': '#A6841F', '--accent-light': '#C9A033',
      '--accent-surface': 'rgba(201,160,51,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(201,160,51,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(201,160,51,0.15)',
      '--gradient-start': '#C9A033', '--gradient-end': '#E2BE5A',
    },
  },

  'emerald-night': {
    name: 'Emerald Night',
    dark: {
      '--bg-primary': '#0A140F', '--bg-secondary': '#142420',
      '--accent': '#10B981', '--accent-light': '#34D399',
      '--accent-surface': 'rgba(16,185,129,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(16,185,129,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(16,185,129,0.20)',
      '--gradient-start': '#059669', '--gradient-end': '#34D399',
    },
    light: {
      '--bg-primary': '#F0FDF9', '--bg-secondary': '#ECFDF5',
      '--accent': '#059669', '--accent-light': '#10B981',
      '--accent-surface': 'rgba(16,185,129,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(16,185,129,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(16,185,129,0.12)',
      '--gradient-start': '#059669', '--gradient-end': '#34D399',
    },
  },

  'crimson-eclipse': {
    name: 'Crimson Eclipse',
    dark: {
      '--bg-primary': '#100A0C', '--bg-secondary': '#1E1215',
      '--accent': '#DC2626', '--accent-light': '#F87171',
      '--accent-surface': 'rgba(220,38,38,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(220,38,38,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(220,38,38,0.20)',
      '--gradient-start': '#991B1B', '--gradient-end': '#EF4444',
    },
    light: {
      '--bg-primary': '#FFF5F5', '--bg-secondary': '#FEE2E2',
      '--accent': '#B91C1C', '--accent-light': '#DC2626',
      '--accent-surface': 'rgba(220,38,38,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(220,38,38,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(220,38,38,0.12)',
      '--gradient-start': '#7F1D1D', '--gradient-end': '#DC2626',
    },
  },

  'graphite': {
    name: 'Graphite',
    dark: {
      '--bg-primary': '#0E0E10', '--bg-secondary': '#1A1A1E',
      '--accent': '#71717A', '--accent-light': '#A1A1AA',
      '--accent-surface': 'rgba(113,113,122,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(255,255,255,0.10)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(161,161,170,0.10)',
      '--gradient-start': '#52525B', '--gradient-end': '#A1A1AA',
    },
    light: {
      '--bg-primary': '#FAFAFA', '--bg-secondary': '#F4F4F5',
      '--accent': '#52525B', '--accent-light': '#71717A',
      '--accent-surface': 'rgba(113,113,122,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(0,0,0,0.08)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(113,113,122,0.08)',
      '--gradient-start': '#71717A', '--gradient-end': '#A1A1AA',
    },
  },
};

export const defaultPalette = 'midnight-purple';
export const defaultTheme = 'dark';

export function applyPalette(paletteName, theme) {
  const palette = palettes[paletteName];
  if (!palette) return;
  const vars = palette[theme] || palette.dark;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
