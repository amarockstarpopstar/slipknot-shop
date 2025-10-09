<template>
  <div>
    <section class="bg-dark text-white py-4 mb-4">
      <div class="container">
        <h1 class="h2 mb-1">Панель менеджера</h1>
        <p class="mb-0">Управляйте товарами и заказами магазина</p>
      </div>
    </section>

    <section class="container pb-5">
      <div v-if="globalError" class="alert alert-danger" role="alert">
        {{ globalError }}
      </div>
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <LoadingSpinner v-if="initialLoading" />
      <div v-else class="row g-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h4 mb-0">Товары</h2>
            <button class="btn btn-outline-secondary" @click="refreshProducts" :disabled="productsLoading">
              Обновить список
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-striped align-middle">
              <thead class="table-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Название</th>
                  <th scope="col">Артикул</th>
                  <th scope="col">Цена</th>
                  <th scope="col">Остаток</th>
                  <th scope="col">Категория</th>
                  <th scope="col">Размер</th>
                  <th scope="col" class="text-end">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <th scope="row">{{ product.id }}</th>
                  <td>{{ product.title }}</td>
                  <td>{{ product.sku }}</td>
                  <td>{{ formatCurrency(product.price) }}</td>
                  <td>{{ product.stockCount }}</td>
                  <td>{{ product.category ? product.category.name : '—' }}</td>
                  <td>{{ product.size ? product.size.name : '—' }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2" @click="startEditProduct(product)">
                      Редактировать
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removeProduct(product)">
                      Удалить
                    </button>
                  </td>
                </tr>
                <tr v-if="!products.length">
                  <td colspan="8" class="text-center text-muted py-4">Товары не найдены</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="productForm" class="card border-dark mt-4">
            <div class="card-header bg-dark text-white">Редактирование товара #{{ productForm.id }}</div>
            <div class="card-body">
              <form @submit.prevent="saveProduct">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label" for="productTitle">Название</label>
                    <input
                      id="productTitle"
                      v-model="productForm.title"
                      type="text"
                      class="form-control"
                      placeholder="Введите название"
                      required
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label" for="productSku">Артикул</label>
                    <input
                      id="productSku"
                      v-model="productForm.sku"
                      type="text"
                      class="form-control"
                      placeholder="Артикул"
                      required
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label" for="productPrice">Цена (₽)</label>
                    <input
                      id="productPrice"
                      v-model="productForm.price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label" for="productStock">Остаток</label>
                    <input
                      id="productStock"
                      v-model="productForm.stockCount"
                      type="number"
                      min="0"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label" for="productCategory">Категория</label>
                    <select id="productCategory" v-model="productForm.categoryId" class="form-select" required>
                      <option value="">Выберите категорию</option>
                      <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label" for="productSize">Размер</label>
                    <select id="productSize" v-model="productForm.sizeId" class="form-select">
                      <option value="">Без размера</option>
                      <option v-for="size in sizes" :key="size.id" :value="String(size.id)">
                        {{ size.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label" for="productImage">Ссылка на изображение</label>
                    <input
                      id="productImage"
                      v-model="productForm.imageUrl"
                      type="url"
                      class="form-control"
                      placeholder="https://"
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label" for="productDescription">Описание</label>
                    <textarea
                      id="productDescription"
                      v-model="productForm.description"
                      class="form-control"
                      rows="3"
                      placeholder="Короткое описание товара"
                    ></textarea>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-4">
                  <button class="btn btn-primary" type="submit" :disabled="productSaving">
                    Сохранить изменения
                  </button>
                  <button class="btn btn-outline-secondary" type="button" @click="cancelProductEdit" :disabled="productSaving">
                    Отменить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h4 mb-0">Заказы</h2>
            <button class="btn btn-outline-secondary" @click="refreshOrders" :disabled="ordersLoading">
              Обновить список
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-striped align-middle">
              <thead class="table-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Покупатель</th>
                  <th scope="col">Статус</th>
                  <th scope="col">Отправка</th>
                  <th scope="col">Сумма</th>
                  <th scope="col">Способ оплаты</th>
                  <th scope="col">Позиций</th>
                  <th scope="col">Обновлен</th>
                  <th scope="col" class="text-end">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <th scope="row">{{ order.id }}</th>
                  <td>
                    <div class="fw-semibold">{{ order.customer.name }}</div>
                    <div class="text-muted small">{{ order.customer.email }}</div>
                  </td>
                  <td>{{ order.status.name }}</td>
                  <td>
                    <div class="fw-semibold">{{ order.shippingStatus }}</div>
                    <div class="text-muted small">{{ formatDate(order.shippingUpdatedAt) }}</div>
                  </td>
                  <td>{{ formatCurrency(order.totalAmount) }}</td>
                  <td>{{ order.paymentMethod || '—' }}</td>
                  <td>{{ order.items.length }}</td>
                  <td>{{ formatDate(order.updatedAt) }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2" @click="startEditOrder(order)">
                      Редактировать
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removeOrder(order)">
                      Удалить
                    </button>
                  </td>
                </tr>
                <tr v-if="!orders.length">
                  <td colspan="9" class="text-center text-muted py-4">Заказы не найдены</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="orderForm" class="card border-dark mt-4">
            <div class="card-header bg-dark text-white">Редактирование заказа #{{ orderForm.id }}</div>
            <div class="card-body">
              <form @submit.prevent="saveOrder">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label" for="orderStatus">Статус</label>
                    <select id="orderStatus" v-model="orderForm.statusId" class="form-select" required>
                      <option value="">Выберите статус</option>
                      <option v-for="status in orderStatuses" :key="status.id" :value="String(status.id)">
                        {{ status.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label" for="orderShippingStatus">Статус отправки</label>
                    <select id="orderShippingStatus" v-model="orderForm.shippingStatus" class="form-select" required>
                      <option v-for="option in shippingStatusOptions" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label" for="orderTotal">Сумма (₽)</label>
                    <input
                      id="orderTotal"
                      v-model="orderForm.totalAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label" for="orderPayment">Способ оплаты</label>
                    <input
                      id="orderPayment"
                      v-model="orderForm.paymentMethod"
                      type="text"
                      class="form-control"
                      placeholder="Например, Банковская карта"
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label" for="orderComment">Комментарий</label>
                    <textarea
                      id="orderComment"
                      v-model="orderForm.comment"
                      class="form-control"
                      rows="3"
                      placeholder="Комментарий к заказу"
                    ></textarea>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-4">
                  <button class="btn btn-primary" type="submit" :disabled="orderSaving">
                    Сохранить изменения
                  </button>
                  <button class="btn btn-outline-secondary" type="button" @click="cancelOrderEdit" :disabled="orderSaving">
                    Отменить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {
  fetchProducts,
  updateProduct,
  deleteProduct,
  type ProductDto,
  type UpdateProductPayload,
} from '../api/products';
import { fetchCategories, type CategoryDto } from '../api/categories';
import { fetchSizes, type SizeDto } from '../api/sizes';
import {
  fetchOrders,
  fetchOrderStatuses,
  updateOrder,
  deleteOrder,
  type OrderDto,
  type OrderStatusDto,
  type UpdateOrderPayload,
} from '../api/orders';
import { extractErrorMessage } from '../api/http';

interface ProductFormState {
  id: number;
  title: string;
  description: string;
  price: string;
  sku: string;
  stockCount: string;
  imageUrl: string;
  categoryId: string;
  sizeId: string;
}

interface OrderFormState {
  id: number;
  statusId: string;
  shippingStatus: string;
  totalAmount: string;
  paymentMethod: string;
  comment: string;
}

const products = ref<ProductDto[]>([]);
const orders = ref<OrderDto[]>([]);
const categories = ref<CategoryDto[]>([]);
const sizes = ref<SizeDto[]>([]);
const orderStatuses = ref<OrderStatusDto[]>([]);
const shippingStatusOptions = ref<string[]>(['Готовится к отправке', 'В пути', 'Доставлен']);

const initialLoading = ref(false);
const productsLoading = ref(false);
const ordersLoading = ref(false);
const productSaving = ref(false);
const orderSaving = ref(false);

const globalError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const productForm = ref<ProductFormState | null>(null);
const orderForm = ref<OrderFormState | null>(null);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return parsed.toLocaleString('ru-RU');
};

const ensureShippingStatusOption = (status: string | null | undefined) => {
  if (!status) {
    return;
  }
  if (!shippingStatusOptions.value.includes(status)) {
    shippingStatusOptions.value.push(status);
  }
};

const showError = (error: unknown) => {
  globalError.value = typeof error === 'string' ? error : extractErrorMessage(error);
  successMessage.value = null;
};

const showSuccess = (message: string) => {
  successMessage.value = message;
  globalError.value = null;
};

const loadInitialData = async () => {
  try {
    initialLoading.value = true;
    globalError.value = null;
    const [productsData, ordersData, categoriesData, sizesData, statusesData] = await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchCategories(),
      fetchSizes(),
      fetchOrderStatuses(),
    ]);
    products.value = productsData;
    orders.value = ordersData;
    ordersData.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
    categories.value = categoriesData;
    sizes.value = sizesData;
    orderStatuses.value = statusesData;
  } catch (error) {
    showError(error);
  } finally {
    initialLoading.value = false;
  }
};

const refreshProducts = async () => {
  try {
    productsLoading.value = true;
    products.value = await fetchProducts();
    showSuccess('Список товаров обновлен');
  } catch (error) {
    showError(error);
  } finally {
    productsLoading.value = false;
  }
};

const refreshOrders = async () => {
  try {
    ordersLoading.value = true;
    const data = await fetchOrders();
    orders.value = data;
    data.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
    showSuccess('Список заказов обновлен');
  } catch (error) {
    showError(error);
  } finally {
    ordersLoading.value = false;
  }
};

const startEditProduct = (product: ProductDto) => {
  productForm.value = {
    id: product.id,
    title: product.title,
    description: product.description ?? '',
    price: product.price.toString(),
    sku: product.sku,
    stockCount: product.stockCount.toString(),
    imageUrl: product.imageUrl ?? '',
    categoryId: product.category ? String(product.category.id) : '',
    sizeId: product.size ? String(product.size.id) : '',
  };
  successMessage.value = null;
};

const cancelProductEdit = () => {
  productForm.value = null;
};

const saveProduct = async () => {
  if (!productForm.value) {
    return;
  }

  const price = Number.parseFloat(productForm.value.price);
  const stockCount = Number.parseInt(productForm.value.stockCount, 10);
  const categoryId = Number.parseInt(productForm.value.categoryId, 10);
  const sizeId = productForm.value.sizeId ? Number.parseInt(productForm.value.sizeId, 10) : null;

  if (Number.isNaN(price) || Number.isNaN(stockCount) || Number.isNaN(categoryId)) {
    showError('Проверьте корректность заполнения полей товара');
    return;
  }

  const payload: UpdateProductPayload = {
    title: productForm.value.title.trim(),
    description: productForm.value.description.trim(),
    price,
    sku: productForm.value.sku.trim(),
    stockCount,
    imageUrl: productForm.value.imageUrl.trim(),
    categoryId,
    sizeId: sizeId ?? null,
  };

  try {
    productSaving.value = true;
    const updated = await updateProduct(productForm.value.id, payload);
    products.value = products.value.map((item) => (item.id === updated.id ? updated : item));
    showSuccess(`Товар #${updated.id} успешно обновлен`);
    startEditProduct(updated);
  } catch (error) {
    showError(error);
  } finally {
    productSaving.value = false;
  }
};

const removeProduct = async (product: ProductDto) => {
  const confirmed = window.confirm(`Удалить товар «${product.title}»?`);
  if (!confirmed) {
    return;
  }

  try {
    await deleteProduct(product.id);
    products.value = products.value.filter((item) => item.id !== product.id);
    if (productForm.value?.id === product.id) {
      productForm.value = null;
    }
    showSuccess('Товар удален');
  } catch (error) {
    showError(error);
  }
};

const startEditOrder = (order: OrderDto) => {
  ensureShippingStatusOption(order.shippingStatus);
  orderForm.value = {
    id: order.id,
    statusId: String(order.status.id),
    shippingStatus: order.shippingStatus,
    totalAmount: order.totalAmount.toString(),
    paymentMethod: order.paymentMethod ?? '',
    comment: order.comment ?? '',
  };
  successMessage.value = null;
};

const cancelOrderEdit = () => {
  orderForm.value = null;
};

const saveOrder = async () => {
  if (!orderForm.value) {
    return;
  }

  const statusId = Number.parseInt(orderForm.value.statusId, 10);
  const totalAmount = Number.parseFloat(orderForm.value.totalAmount);

  if (Number.isNaN(statusId) || Number.isNaN(totalAmount)) {
    showError('Проверьте корректность заполнения полей заказа');
    return;
  }

  const paymentMethod = orderForm.value.paymentMethod.trim();
  const comment = orderForm.value.comment.trim();
  const shippingStatus =
    orderForm.value.shippingStatus.trim() || shippingStatusOptions.value[0] || 'Готовится к отправке';

  const payload: UpdateOrderPayload = {
    statusId,
    totalAmount,
    paymentMethod: paymentMethod.length ? paymentMethod : undefined,
    comment: comment.length ? comment : undefined,
    shippingStatus,
  };

  try {
    orderSaving.value = true;
    const updated = await updateOrder(orderForm.value.id, payload);
    orders.value = orders.value.map((item) => (item.id === updated.id ? updated : item));
    showSuccess(`Заказ #${updated.id} успешно обновлен`);
    startEditOrder(updated);
  } catch (error) {
    showError(error);
  } finally {
    orderSaving.value = false;
  }
};

const removeOrder = async (order: OrderDto) => {
  const confirmed = window.confirm(`Удалить заказ #${order.id}?`);
  if (!confirmed) {
    return;
  }

  try {
    await deleteOrder(order.id);
    orders.value = orders.value.filter((item) => item.id !== order.id);
    if (orderForm.value?.id === order.id) {
      orderForm.value = null;
    }
    showSuccess('Заказ удален');
  } catch (error) {
    showError(error);
  }
};

onMounted(async () => {
  await loadInitialData();
});
</script>
