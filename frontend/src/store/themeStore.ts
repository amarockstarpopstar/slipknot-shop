import { defineStore } from 'pinia';
import { watch, type WatchStopHandle } from 'vue';
import { useAuthStore } from './authStore';
import {
  fetchUserSettings,
  updateUserSettings,
  type ThemeVariant,
  type UserSettingsResponse,
} from '../api/userSettings';

type Theme = ThemeVariant;

interface ThemeState {
  theme: Theme;
  ready: boolean;
  loading: boolean;
  stopAuthWatcher: WatchStopHandle | null;
}

const DEFAULT_THEME: Theme = 'dark';

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    theme: DEFAULT_THEME,
    ready: false,
    loading: false,
    stopAuthWatcher: null,
  }),
  actions: {
    async initialize() {
      if (this.ready || this.loading) {
        return;
      }

      const authStore = useAuthStore();
      this.ensureAuthWatcher(authStore);

      this.loading = true;

      if (!authStore.isAuthenticated) {
        this.theme = DEFAULT_THEME;
        this.finishLoading();
        return;
      }

      try {
        const settings = await this.safeFetchSettings();
        if (settings?.theme) {
          this.theme = settings.theme;
        }
      } catch (error) {
        console.warn('Не удалось загрузить настройки пользователя', error);
      } finally {
        this.finishLoading();
      }
    },
    ensureAuthWatcher(authStore: ReturnType<typeof useAuthStore>) {
      if (this.stopAuthWatcher) {
        return;
      }
      this.stopAuthWatcher = watch(
        () => authStore.isAuthenticated,
        (isAuthenticated) => {
          if (isAuthenticated) {
            this.ready = false;
            void this.initialize();
            return;
          }
          this.reset();
        },
        { immediate: false },
      );
    },
    async safeFetchSettings(): Promise<UserSettingsResponse | null> {
      try {
        return await fetchUserSettings();
      } catch (error) {
        console.warn('Ошибка при получении настроек', error);
        return null;
      }
    },
    async setTheme(value: Theme) {
      this.theme = value;
      this.applyTheme();

      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        return;
      }

      try {
        await updateUserSettings({ theme: value });
      } catch (error) {
        console.warn('Не удалось сохранить тему на сервере', error);
      }
    },
    async toggleTheme() {
      const nextTheme: Theme = this.theme === 'dark' ? 'light' : 'dark';
      await this.setTheme(nextTheme);
    },
    applyTheme() {
      if (typeof document === 'undefined') {
        return;
      }
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    reset() {
      this.theme = DEFAULT_THEME;
      this.loading = false;
      this.ready = true;
      this.applyTheme();
    },
    finishLoading() {
      this.loading = false;
      this.ready = true;
      this.applyTheme();
    },
  },
});
