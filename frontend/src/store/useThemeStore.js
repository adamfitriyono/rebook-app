import { create } from 'zustand';
import { revealThemeChange } from '../utils/themeTransition';

const STORAGE_KEY = 'rebook-theme';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return getSystemTheme();
}

function setThemeClass(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  setThemeClass(theme);
}

function commitTheme(theme, set) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  set({ theme });
}

export const useThemeStore = create((set, get) => ({
  theme: resolveTheme(),

  init: () => {
    const theme = resolveTheme();
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: (origin) => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';

    revealThemeChange({
      theme: next,
      origin,
      onApply: () => commitTheme(next, set),
    });
  },

  setTheme: (theme, origin) => {
    revealThemeChange({
      theme,
      origin,
      onApply: () => commitTheme(theme, set),
    });
  },
}));
