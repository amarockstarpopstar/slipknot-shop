import { defineStore } from 'pinia';

const STORAGE_KEY = 'slipknot-shop-theme';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  ready: boolean;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    theme: 'dark',
    ready: false,
  }),
  actions: {
    initialize() {
      if (this.ready) {
        return;
      }
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored === 'light' || stored === 'dark') {
          this.theme = stored;
        }
      }
      this.ready = true;
      this.applyTheme();
    },
    setTheme(value: Theme) {
      this.theme = value;
      this.applyTheme();
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, value);
      }
    },
    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    },
    applyTheme() {
      if (typeof document === 'undefined') {
        return;
      }
      document.documentElement.setAttribute('data-theme', this.theme);
    },
  },
});
