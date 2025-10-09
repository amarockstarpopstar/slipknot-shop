<template>
  <section class="py-5 bg-dark text-white min-vh-100">
    <div class="container">
      <h1 class="display-5 fw-bold mb-4">Оплата заказа</h1>

      <LoadingSpinner v-if="loading && !hasItems && !paymentSuccess" />

      <div v-else>
        <div v-if="paymentSuccess" class="mb-5">
          <div class="alert alert-success" role="alert">
            Заказ №{{ lastOrder?.orderId }} успешно оплачен. Сумма: {{ formatCurrency(lastOrder?.totalAmount ?? 0) }}
          </div>
          <div class="card bg-secondary border-0 text-white shadow-lg">
            <div class="card-body">
              <h2 class="h4 mb-3">Статус отправки</h2>
              <p class="mb-1 fw-semibold">{{ lastOrder?.shippingStatus }}</p>
              <p class="mb-3 text-muted small">Обновлено: {{ formatDate(lastOrder?.shippingUpdatedAt ?? '') }}</p>
              <RouterLink class="btn btn-outline-light me-2" to="/orders">Перейти к истории заказов</RouterLink>
              <RouterLink class="btn btn-light" to="/">Продолжить покупки</RouterLink>
            </div>
          </div>
        </div>

        <div v-else>
          <div v-if="!items.length" class="alert alert-info" role="alert">
            Корзина пуста. Добавьте товары, чтобы оформить заказ.
          </div>
          <div v-else class="row g-4">
            <div class="col-lg-8">
              <div class="list-group shadow-lg">
                <article
                  v-for="item in items"
                  :key="item.id"
                  class="list-group-item bg-dark text-white border-secondary d-flex gap-3 align-items-center"
                >
                  <img
                    v-if="item.product.imageUrl"
                    :src="item.product.imageUrl"
                    class="rounded"
                    width="96"
                    height="96"
                    :alt="item.product.title"
                  />
                  <div class="flex-grow-1">
                    <h2 class="h5 mb-2">{{ item.product.title }}</h2>
                    <p class="mb-1 text-muted">Цена: {{ formatCurrency(item.product.price) }}</p>
                    <p class="mb-0 text-muted">Количество: {{ item.quantity }}</p>
                  </div>
                </article>
              </div>
            </div>
            <div class="col-lg-4">
              <aside class="card shadow-lg bg-secondary text-white border-0">
                <div class="card-body">
                  <h2 class="h4 mb-3">К оплате</h2>
                  <p class="mb-1">Товаров: {{ totalQuantity }}</p>
                  <p class="mb-3">Сумма: {{ formatCurrency(totalAmount) }}</p>
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    @click="payOrder"
                    :disabled="updating || !items.length || addressSaving"
                  >
                    Оплатить
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <p v-if="localError" class="alert alert-danger mt-4 mb-0">{{ localError }}</p>
      </div>
    </div>
  </section>

  <div v-if="showCountryModal" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5">Заказ недоступен</h2>
          <button type="button" class="btn-close" aria-label="Закрыть" @click="closeCountryModal"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Оформление заказов доступно только пользователям из России.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeCountryModal">Понятно</button>
          <RouterLink class="btn btn-danger" to="/profile" @click="closeCountryModal">
            Перейти в профиль
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showCountryModal" class="modal-backdrop fade show"></div>

  <div v-if="showAddressModal" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <form @submit.prevent="submitAddress">
          <div class="modal-header">
            <h2 class="modal-title h5">Укажите адрес доставки</h2>
            <button
              type="button"
              class="btn-close"
              aria-label="Закрыть"
              @click="closeAddressModal"
              :disabled="addressSaving"
            ></button>
          </div>
          <div class="modal-body text-dark">
            <p class="text-muted">Для оформления заказа заполните все поля.</p>
            <div class="row g-3">
              <div class="col-md-6">
                <label for="checkoutCountry" class="form-label">Страна</label>
                <select
                  id="checkoutCountry"
                  v-model="addressForm.country"
                  class="form-select"
                  required
                >
                  <option value="">Выберите страну</option>
                  <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Город</label>
                <div class="d-flex gap-2">
                  <select
                    v-if="!addressForm.useCustomCity"
                    v-model="addressForm.city"
                    class="form-select flex-grow-1"
                    :disabled="!addressForm.country"
                    required
                  >
                    <option value="">Выберите город</option>
                    <option v-for="cityOption in addressCityOptions" :key="cityOption" :value="cityOption">
                      {{ cityOption }}
                    </option>
                  </select>
                  <input
                    v-else
                    v-model="addressForm.customCity"
                    type="text"
                    class="form-control flex-grow-1"
                    placeholder="Введите город"
                    required
                  />
                  <button type="button" class="btn btn-outline-secondary" @click="toggleAddressCityInput">
                    {{ addressForm.useCustomCity ? 'Выбрать из списка' : 'Ввести' }}
                  </button>
                </div>
                <small class="text-muted">Выберите город или введите свой</small>
              </div>
              <div class="col-12">
                <label for="checkoutAddress" class="form-label">Адрес</label>
                <textarea
                  id="checkoutAddress"
                  v-model="addressForm.address"
                  class="form-control"
                  rows="3"
                  placeholder="Улица, дом, квартира"
                  required
                ></textarea>
              </div>
            </div>
            <p v-if="addressError" class="alert alert-danger mt-3 mb-0">{{ addressError }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddressModal" :disabled="addressSaving">
              Отмена
            </button>
            <button type="submit" class="btn btn-danger" :disabled="addressSaving">
              {{ addressSaving ? 'Сохранение...' : 'Сохранить адрес' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="showAddressModal" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { extractErrorMessage } from '../api/http';

const cartStore = useCartStore();
const { items, totalAmount, totalQuantity, loading, updating, error, lastOrder } = storeToRefs(cartStore);

const localError = ref<string | null>(null);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const showAddressModal = ref(false);
const showCountryModal = ref(false);
const addressError = ref<string | null>(null);
const addressSaving = ref(false);

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

const addressForm = reactive({
  country: 'Россия',
  city: '',
  customCity: '',
  useCustomCity: false,
  address: '',
});

const addressCityOptions = computed(() => citiesByCountry[addressForm.country] ?? []);

const addressResolvedCity = computed(() => {
  const value = addressForm.useCustomCity ? addressForm.customCity : addressForm.city;
  return value.trim();
});

watch(
  () => addressForm.country,
  (country) => {
    const options = citiesByCountry[country] ?? [];
    if (!country) {
      addressForm.city = '';
      addressForm.useCustomCity = false;
      addressForm.customCity = '';
      return;
    }

    if (!options.includes(addressForm.city)) {
      addressForm.city = '';
    }
    if (!addressForm.useCustomCity) {
      addressForm.customCity = '';
    }
  },
);

const ONLY_RUSSIA_MESSAGE = 'Оформление заказов доступно только пользователям из России.';
const ADDRESS_REQUIRED_SUBSTRING = 'Укажите адрес доставки';

const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const formatDate = (value: string) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return date.toLocaleString('ru-RU');
};

const hasItems = computed(() => items.value.length > 0);

const paymentSuccess = computed(() => Boolean(lastOrder.value));

const ensureProfileLoaded = async () => {
  if (user.value) {
    return true;
  }
  try {
    await authStore.loadProfile();
    return Boolean(user.value);
  } catch (err) {
    localError.value = extractErrorMessage(err) ?? 'Не удалось загрузить профиль пользователя.';
    return false;
  }
};

const fillAddressFormFromUser = () => {
  const profile = user.value;
  const profileCountry = profile?.country?.trim();
  addressForm.country = profileCountry ? profileCountry : 'Россия';
  addressForm.address = profile?.address ?? '';

  const availableCities = citiesByCountry[addressForm.country] ?? [];
  const profileCity = profile?.city ?? '';
  if (profileCity && availableCities.includes(profileCity)) {
    addressForm.city = profileCity;
    addressForm.useCustomCity = false;
    addressForm.customCity = '';
  } else if (profileCity) {
    addressForm.city = '';
    addressForm.useCustomCity = true;
    addressForm.customCity = profileCity;
  } else {
    addressForm.city = '';
    addressForm.useCustomCity = false;
    addressForm.customCity = '';
  }
};

const openAddressModal = () => {
  fillAddressFormFromUser();
  addressError.value = null;
  showAddressModal.value = true;
};

const closeAddressModal = () => {
  if (addressSaving.value) {
    return;
  }
  showAddressModal.value = false;
};

const toggleAddressCityInput = () => {
  addressForm.useCustomCity = !addressForm.useCustomCity;
  if (addressForm.useCustomCity) {
    addressForm.city = '';
  } else {
    addressForm.customCity = '';
  }
};

const proceedCheckout = async () => {
  const result = await cartStore.checkout();
  if (!result) {
    localError.value = error.value ?? 'Не удалось оформить заказ. Попробуйте ещё раз.';
  } else {
    localError.value = null;
  }
  return result;
};

const showCountryRestriction = () => {
  showCountryModal.value = true;
};

const payOrder = async () => {
  localError.value = null;

  const hasProfile = await ensureProfileLoaded();
  if (!hasProfile) {
    return;
  }

  const profile = user.value;
  const country = profile?.country?.trim() ?? '';
  const city = profile?.city?.trim() ?? '';
  const address = profile?.address?.trim() ?? '';

  if (country && country.toLowerCase() !== 'россия') {
    showCountryRestriction();
    return;
  }

  if (!country || !city || !address) {
    openAddressModal();
    return;
  }

  await proceedCheckout();
};

const submitAddress = async () => {
  addressError.value = null;

  const country = addressForm.country.trim();
  const city = addressResolvedCity.value;
  const address = addressForm.address.trim();

  if (!country) {
    addressError.value = 'Выберите страну.';
    return;
  }

  if (!city) {
    addressError.value = 'Укажите город.';
    return;
  }

  if (!address) {
    addressError.value = 'Введите полный адрес.';
    return;
  }

  if (country.toLowerCase() !== 'россия') {
    showAddressModal.value = false;
    showCountryRestriction();
    return;
  }

  try {
    addressSaving.value = true;
    await authStore.updateProfile({ country, city, address });
    showAddressModal.value = false;
    await proceedCheckout();
  } catch (err) {
    addressError.value = extractErrorMessage(err) ?? 'Не удалось сохранить адрес.';
  } finally {
    addressSaving.value = false;
  }
};

const closeCountryModal = () => {
  showCountryModal.value = false;
};

onMounted(() => {
  localError.value = error.value;
  if (!items.value.length) {
    void cartStore.loadCart();
  }
  if (!user.value) {
    void authStore.loadProfile();
  }
});

watch(error, (value) => {
  localError.value = value ?? null;
  if (!value) {
    return;
  }
  if (value === ONLY_RUSSIA_MESSAGE) {
    showCountryRestriction();
  } else if (value.includes(ADDRESS_REQUIRED_SUBSTRING) && !showAddressModal.value) {
    openAddressModal();
  }
});
</script>
