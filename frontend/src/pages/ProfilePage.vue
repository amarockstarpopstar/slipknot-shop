<template>
  <section class="section fade-in-up">
    <div class="layout-container">
      <div class="profile-header">
        <div>
          <span class="chip mb-2">Профиль</span>
          <h1 class="section-title mb-0">Личные данные</h1>
        </div>
      </div>

      <div v-if="!isAuthenticated" class="alert alert-warning" role="alert">
        Выполните вход, чтобы просмотреть информацию профиля.
        <RouterLink class="accent-link ms-1" to="/auth">Перейти к авторизации</RouterLink>
      </div>

      <div v-else>
        <LoadingSpinner v-if="loading && !user" />

        <div v-else>
          <p v-if="localError" class="alert alert-danger">{{ localError }}</p>
          <p v-if="successMessage" class="alert alert-success">{{ successMessage }}</p>

          <div v-if="user" class="profile-grid">
            <form class="profile-card" @submit.prevent="saveProfile">
              <div class="profile-card__header">
                <div>
                  <h2 class="profile-card__title">Личные данные</h2>
                  <p class="profile-card__subtitle">Измените имя, email, телефон и пароль</p>
                </div>
                <span class="profile-role">{{ user.role?.name ?? 'Покупатель' }}</span>
              </div>

              <div class="profile-form">
                <div class="profile-form__field">
                  <label for="profileName" class="form-label">Имя</label>
                  <input
                    id="profileName"
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    required
                    minlength="2"
                    maxlength="150"
                  />
                </div>
                <div class="profile-form__field">
                  <label for="profileEmail" class="form-label">Email</label>
                  <input
                    id="profileEmail"
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    required
                    maxlength="150"
                  />
                </div>
                <div class="profile-form__field">
                  <label for="profilePhone" class="form-label">Телефон</label>
                  <input
                    id="profilePhone"
                    v-model="form.phone"
                    type="tel"
                    inputmode="tel"
                    class="form-control"
                    placeholder="Например, +7 900 000-00-00"
                    maxlength="30"
                  />
                </div>
                <div class="profile-form__field">
                  <label for="profilePassword" class="form-label">Новый пароль</label>
                  <input
                    id="profilePassword"
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    placeholder="Оставьте пустым, чтобы не менять пароль"
                    minlength="6"
                    maxlength="100"
                  />
                </div>
              </div>

              <button class="btn btn-danger w-100" type="submit" :disabled="updating || !canSubmit">
                {{ updating ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
            </form>

            <div class="profile-card profile-card--secondary">
              <div class="profile-card__header">
                <div>
                  <h2 class="profile-card__title">Адрес доставки</h2>
                  <p class="profile-card__subtitle">Страна, город и подробный адрес</p>
                </div>
                <span class="profile-status" :class="hasAddress ? 'profile-status--success' : 'profile-status--warning'">
                  {{ hasAddress ? 'Адрес заполнен' : 'Адрес не указан' }}
                </span>
              </div>

              <div class="profile-form">
                <div class="profile-form__field">
                  <label for="profileCountry" class="form-label">Страна</label>
                  <select id="profileCountry" v-model="form.country" class="form-select">
                    <option value="">Выберите страну</option>
                    <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                  </select>
                </div>

                <div class="profile-form__field">
                  <label class="form-label">Город</label>
                  <div class="profile-city">
                    <select
                      v-if="!form.useCustomCity"
                      v-model="form.city"
                      class="form-select flex-grow-1"
                      :disabled="!form.country"
                    >
                      <option value="">Выберите город</option>
                      <option v-for="cityOption in cityOptions" :key="cityOption" :value="cityOption">
                        {{ cityOption }}
                      </option>
                    </select>
                    <input
                      v-else
                      v-model="form.customCity"
                      type="text"
                      class="form-control flex-grow-1"
                      placeholder="Введите город"
                    />
                    <button type="button" class="btn btn-outline-secondary" @click="toggleCityInput">
                      {{ form.useCustomCity ? 'Выбрать из списка' : 'Ввести' }}
                    </button>
                  </div>
                  <small class="text-muted">Список городов зависит от выбранной страны</small>
                </div>

                <div class="profile-form__field">
                  <label for="profileAddress" class="form-label">Адрес</label>
                  <textarea
                    id="profileAddress"
                    v-model="form.address"
                    class="form-control"
                    rows="3"
                    placeholder="Улица, дом, квартира"
                    maxlength="500"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="alert alert-info" role="alert">
            Данные профиля пока не загружены.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute } from 'vue-router';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useAuthStore } from '../store/authStore';
import { SUPPORTED_COUNTRIES, getCitiesByCountry } from '../utils/location';

const authStore = useAuthStore();
const { user, loading, updating, error, isAuthenticated } = storeToRefs(authStore);
const route = useRoute();

const countries = [...SUPPORTED_COUNTRIES];

const ALLOWED_PHONE_CHARACTERS = /[^\d+()\-\s]/g;

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  country: '',
  city: '',
  customCity: '',
  useCustomCity: false,
  address: '',
});

const localError = ref<string | null>(null);
const successMessage = ref('');

const hasAddress = computed(() => {
  const country = form.country.trim();
  const city = form.useCustomCity ? form.customCity.trim() : form.city.trim();
  const address = form.address.trim();
  return Boolean(country && city && address);
});

const cityOptions = computed(() => getCitiesByCountry(form.country));

const canSubmit = computed(() => form.name.trim().length >= 2 && form.email.trim().length > 0);

const toggleCityInput = () => {
  form.useCustomCity = !form.useCustomCity;
  form.city = '';
  form.customCity = '';
};

const resetForm = () => {
  form.name = '';
  form.email = '';
  form.phone = '';
  form.password = '';
  form.country = '';
  form.city = '';
  form.customCity = '';
  form.useCustomCity = false;
  form.address = '';
};

const loadProfileData = async () => {
  if (!isAuthenticated.value) {
    resetForm();
    return;
  }

  localError.value = null;
  successMessage.value = '';

  try {
    await authStore.loadProfile();
  } catch (err) {
    console.error('Failed to load profile data', err);
    localError.value = 'Не удалось загрузить профиль. Попробуйте ещё раз.';
  }
};

const saveProfile = async () => {
  try {
    localError.value = null;
    successMessage.value = '';
    await authStore.updateProfile({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password || undefined,
      country: form.country || undefined,
      city: form.useCustomCity ? form.customCity || undefined : form.city || undefined,
      address: form.address || undefined,
    });
    form.password = '';
    successMessage.value = 'Профиль обновлён.';
  } catch (err) {
    console.error('Failed to update profile', err);
    localError.value = 'Не удалось сохранить профиль. Проверьте данные и попробуйте ещё раз.';
  }
};

watch(user, (value) => {
  if (!value) {
    return;
  }
  form.name = value.name ?? '';
  form.email = value.email ?? '';
  form.phone = value.phone ?? '';
  form.country = value.country ?? '';
  form.city = value.city ?? '';
  form.customCity = '';
  form.useCustomCity = Boolean(value.city && !cityOptions.value.includes(value.city));
  if (form.useCustomCity) {
    form.customCity = value.city ?? '';
    form.city = '';
  }
  form.address = value.address ?? '';
});

watch(
  () => form.phone,
  (value) => {
    if (typeof value !== 'string') {
      return;
    }
    const sanitized = value.replace(ALLOWED_PHONE_CHARACTERS, '');
    if (sanitized !== value) {
      form.phone = sanitized;
    }
  },
);

watch(error, (value) => {
  if (value) {
    localError.value = value;
  }
});

onMounted(() => {
  void loadProfileData();
});

watch(
  () => route.fullPath,
  () => {
    void loadProfileData();
  },
);

watch(isAuthenticated, (loggedIn) => {
  if (loggedIn) {
    void loadProfileData();
    return;
  }
  resetForm();
  successMessage.value = '';
});
</script>

<style scoped>
.profile-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.profile-card {
  padding: clamp(1.75rem, 3vw, 2.5rem);
  border-radius: calc(var(--radius-lg) * 1.1);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card--secondary {
  backdrop-filter: blur(var(--blur-radius));
}

.profile-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.profile-card__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
}

.profile-card__subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.profile-role {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 20%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.profile-status {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--color-accent) 25%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
}

.profile-status--success {
  background: color-mix(in srgb, var(--color-success) 25%, transparent);
  border-color: color-mix(in srgb, var(--color-success) 45%, transparent);
}

.profile-status--warning {
  background: color-mix(in srgb, var(--color-danger) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-danger) 40%, transparent);
}

.profile-form {
  display: grid;
  gap: 1.25rem;
}

.profile-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-city {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.profile-city :deep(.btn) {
  white-space: nowrap;
}

@media (max-width: 575.98px) {
  .profile-header :deep(.btn) {
    width: 100%;
  }
}
</style>
