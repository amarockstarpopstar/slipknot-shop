import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../api/auth';
import { login, register } from '../api/auth';
import type { UpdateProfilePayload, UserProfile } from '../api/users';
import { fetchProfile, updateProfile } from '../api/users';
import { extractErrorMessage } from '../api/http';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null);
  const loading = ref(false);
  const updating = ref(false);
  const error = ref<string | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  const logAuthState = () => {
    console.info('Auth state updated', {
      isAuthenticated: isAuthenticated.value,
      user: user.value,
    });
  };

  const persistTokens = (auth: AuthResponse) => {
    accessToken.value = auth.accessToken;
    refreshToken.value = auth.refreshToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  };

  const clearTokens = () => {
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const setAuthState = (auth: AuthResponse) => {
    persistTokens(auth);
    user.value = auth.user;
    error.value = null;
    console.info('User logged in', { id: auth.user.id, email: auth.user.email });
    logAuthState();
  };

  const loginUser = async (payload: LoginPayload) => {
    try {
      loading.value = true;
      const auth = await login(payload);
      setAuthState(auth);
    } catch (err) {
      error.value = extractErrorMessage(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const registerUser = async (payload: RegisterPayload) => {
    try {
      loading.value = true;
      const auth = await register(payload);
      setAuthState(auth);
    } catch (err) {
      error.value = extractErrorMessage(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadProfile = async () => {
    try {
      loading.value = true;
      const profile = await fetchProfile();
      user.value = profile;
      error.value = null;
      logAuthState();
    } catch (err) {
      error.value = extractErrorMessage(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProfileData = async (payload: UpdateProfilePayload) => {
    try {
      updating.value = true;
      const updated = await updateProfile(payload);
      user.value = updated;
      error.value = null;
      return updated;
    } catch (err) {
      error.value = extractErrorMessage(err);
      throw err;
    } finally {
      updating.value = false;
    }
  };

  const logout = () => {
    clearTokens();
    user.value = null;
    error.value = null;
    console.info('User logged out');
    logAuthState();
  };

  const initialize = async () => {
    if (!accessToken.value) {
      return;
    }

    if (user.value) {
      return;
    }

    try {
      await loadProfile();
    } catch (err) {
      console.warn('Failed to restore session', err);
      logout();
    }
  };

  const syncFromStorage = async () => {
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    const tokenChanged = storedAccess !== accessToken.value || storedRefresh !== refreshToken.value;

    accessToken.value = storedAccess;
    refreshToken.value = storedRefresh;

    if (!storedAccess) {
      if (user.value) {
        user.value = null;
        console.info('User logged out');
        logAuthState();
      }
      return;
    }

    if (tokenChanged && !user.value) {
      try {
        await loadProfile();
      } catch (err) {
        console.warn('Failed to sync auth state from storage', err);
        logout();
      }
      return;
    }

    if (tokenChanged) {
      logAuthState();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event: StorageEvent) => {
      if (!event.key || event.key === ACCESS_TOKEN_KEY || event.key === REFRESH_TOKEN_KEY) {
        void syncFromStorage();
      }
    });
  }

  watch(
    accessToken,
    (token, previous) => {
      if (!token && previous && user.value) {
        user.value = null;
        console.info('User logged out');
        logAuthState();
      }
    },
    { flush: 'post' }
  );

  return {
    user,
    loading,
    updating,
    error,
    isAuthenticated,
    loginUser,
    registerUser,
    loadProfile,
    updateProfile: updateProfileData,
    logout,
    initialize,
  };
});
