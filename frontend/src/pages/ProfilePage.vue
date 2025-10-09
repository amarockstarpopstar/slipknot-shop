<template>
  <section class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h1 class="display-6 fw-bold mb-3 mb-md-0">Профиль</h1>
        <button class="btn btn-outline-secondary" type="button" @click="refreshProfile" :disabled="loading">
          Обновить данные
        </button>
      </div>

      <div v-if="!isAuthenticated" class="alert alert-warning" role="alert">
        Выполните вход, чтобы просмотреть информацию профиля.
        <RouterLink class="alert-link" to="/auth">Перейти к авторизации</RouterLink>
      </div>

      <div v-else>
        <LoadingSpinner v-if="loading && !user" />

        <div v-else>
          <p v-if="localError" class="alert alert-danger">{{ localError }}</p>
          <p v-if="successMessage" class="alert alert-success">{{ successMessage }}</p>

          <div v-if="user" class="row g-4">
            <div class="col-lg-6">
              <form class="card shadow-sm" @submit.prevent="saveProfile">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h2 class="h5 mb-1">Личные данные</h2>
                      <p class="text-muted small mb-0">Измените имя, email, телефон и пароль</p>
                    </div>
                    <span class="badge bg-dark">{{ user.role?.name ?? 'Покупатель' }}</span>
                  </div>

                  <div class="row g-3">
                    <div class="col-12">
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
                    <div class="col-12">
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
                    <div class="col-12">
                      <label for="profilePhone" class="form-label">Телефон</label>
                      <input
                        id="profilePhone"
                        v-model="form.phone"
                        type="tel"
                        class="form-control"
                        placeholder="Например, +7 900 000-00-00"
                        maxlength="30"
                      />
                    </div>
                    <div class="col-12">
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

                  <div class="d-grid mt-4">
                    <button class="btn btn-danger" type="submit" :disabled="updating || !canSubmit">
                      {{ updating ? 'Сохранение...' : 'Сохранить изменения' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div class="col-lg-6">
              <div class="card shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h2 class="h5 mb-1">Адрес доставки</h2>
                      <p class="text-muted small mb-0">Страна, город и подробный адрес</p>
                    </div>
                    <span
                      class="badge"
                      :class="hasAddress ? 'bg-success' : 'bg-secondary'"
                    >
                      {{ hasAddress ? 'Адрес заполнен' : 'Адрес не указан' }}
                    </span>
                  </div>

                  <div class="row g-3">
                    <div class="col-12">
                      <label for="profileCountry" class="form-label">Страна</label>
                      <select
                        id="profileCountry"
                        v-model="form.country"
                        class="form-select"
                      >
                        <option value="">Выберите страну</option>
                        <option v-for="country in countries" :key="country" :value="country">
                          {{ country }}
                        </option>
                      </select>
                    </div>

                    <div class="col-12">
                      <label class="form-label">Город</label>
                      <div class="d-flex gap-3">
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
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="toggleCityInput"
                        >
                          {{ form.useCustomCity ? 'Выбрать из списка' : 'Ввести' }}
                        </button>
                      </div>
                      <small class="text-muted">Список городов зависит от выбранной страны</small>
                    </div>

                    <div class="col-12">
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
import { RouterLink } from 'vue-router';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useAuthStore } from '../store/authStore';

const authStore = useAuthStore();
const { user, loading, updating, error, isAuthenticated } = storeToRefs(authStore);

const countries = [
  'Россия',
  'Беларусь',
  'Казахстан',
  'Армения',
  'Грузия',
  'Другая страна',
];

const citiesByCountry: Record<string, string[]> = {
  Россия: ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'],
  Беларусь: ['Минск', 'Гомель', 'Витебск', 'Могилёв'],
  Казахстан: ['Астана', 'Алматы', 'Шымкент', 'Караганда'],
  Армения: ['Ереван', 'Гюмри', 'Ванадзор'],
  Грузия: ['Тбилиси', 'Батуми', 'Кутаиси'],
  'Другая страна': [],
};

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  country: '',
  city: '',
  address: '',
  useCustomCity: false,
  customCity: '',
});

const successMessage = ref<string | null>(null);
const localError = ref<string | null>(null);

const cityOptions = computed(() => citiesByCountry[form.country] ?? []);

const hasAddress = computed(() => {
  const cityValue = form.useCustomCity ? form.customCity.trim() : form.city.trim();
  return Boolean(form.country && cityValue && form.address.trim());
});

const resolvedCity = computed(() => {
  const value = form.useCustomCity ? form.customCity : form.city;
  return value.trim();
});

const canSubmit = computed(() => Boolean(form.name.trim() && form.email.trim()));

const toggleCityInput = () => {
  form.useCustomCity = !form.useCustomCity;
  if (form.useCustomCity) {
    form.city = '';
  } else {
    form.customCity = '';
  }
};

const applyUserToForm = () => {
  if (!user.value) {
    form.name = '';
    form.email = '';
    form.phone = '';
    form.password = '';
    form.country = '';
    form.city = '';
    form.address = '';
    form.useCustomCity = false;
    form.customCity = '';
    return;
  }

  form.name = user.value.name ?? '';
  form.email = user.value.email ?? '';
  form.phone = user.value.phone ?? '';
  form.password = '';
  form.country = user.value.country ?? '';
  form.address = user.value.address ?? '';

  const availableCities = citiesByCountry[form.country] ?? [];
  const userCity = user.value.city ?? '';
  if (userCity && availableCities.includes(userCity)) {
    form.city = userCity;
    form.useCustomCity = false;
    form.customCity = '';
  } else if (userCity) {
    form.city = '';
    form.useCustomCity = true;
    form.customCity = userCity;
  } else {
    form.city = '';
    form.useCustomCity = false;
    form.customCity = '';
  }
};

watch(user, applyUserToForm, { immediate: true });

watch(error, (value) => {
  localError.value = value ?? null;
});

watch(
  () => form.country,
  (country) => {
    const options = citiesByCountry[country] ?? [];
    if (!country) {
      form.city = '';
      form.useCustomCity = false;
      form.customCity = '';
      return;
    }

    if (!options.includes(form.city)) {
      form.city = '';
    }
    if (!form.useCustomCity) {
      form.customCity = '';
    }
  },
);

const refreshProfile = async () => {
  successMessage.value = null;
  localError.value = null;
  await authStore.loadProfile();
};

const saveProfile = async () => {
  successMessage.value = null;
  localError.value = null;

  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() ? form.phone.trim() : null,
    country: form.country ? form.country : null,
    city: resolvedCity.value ? resolvedCity.value : null,
    address: form.address.trim() ? form.address.trim() : null,
  } as Parameters<typeof authStore.updateProfile>[0];

  if (form.password.trim()) {
    payload.password = form.password.trim();
  }

  try {
    await authStore.updateProfile(payload);
    successMessage.value = 'Данные профиля обновлены';
    form.password = '';
  } catch (err) {
    console.error('Не удалось обновить профиль', err);
  }
};

onMounted(() => {
  if (!user.value && !loading.value) {
    void authStore.loadProfile();
  }
});
</script>
