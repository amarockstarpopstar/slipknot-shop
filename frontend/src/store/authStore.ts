import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
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
