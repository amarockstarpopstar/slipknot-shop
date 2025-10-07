import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../api/auth';
import { login, register } from '../api/auth';
import type { UserProfile } from '../api/users';
import { fetchProfile } from '../api/users';
import { extractErrorMessage } from '../api/http';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const persistTokens = (auth: AuthResponse) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)));

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

  const logout = () => {
    clearTokens();
    user.value = null;
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    loginUser,
    registerUser,
    loadProfile,
    logout,
  };
});
