<template>
  <div class="manager-page-view">
    <section class="section fade-in-up">
      <div class="layout-container manager-page">
        <header class="manager-header">
          <div>
            <span class="chip mb-2">Менеджмент</span>
            <h1 class="section-title mb-1">Панель менеджера</h1>
            <p class="section-subtitle mb-0">Управляйте товарами и заказами магазина.</p>
          </div>
        </header>

        <div v-if="globalError" class="alert alert-danger" role="alert">{{ globalError }}</div>
        <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>

        <LoadingSpinner v-if="initialLoading" />

        <div v-else class="manager-grid">
        <section class="manager-block">
          <div class="manager-block__header">
            <h2 class="manager-block__title">Товары</h2>
            <div class="manager-block__actions">
              <button class="btn btn-outline-secondary" @click="refreshProducts" :disabled="productsLoading">
                Обновить список
              </button>
              <button class="btn btn-primary" type="button" @click="openAddProductModal">
                Добавить товар
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table align-middle mb-0 manager-table">
              <colgroup>
                <col style="width: 5rem" />
                <col style="width: 18rem" />
                <col style="width: 12rem" />
                <col style="width: 10rem" />
                <col style="width: 9rem" />
                <col style="width: 18rem" />
                <col style="width: 12rem" />
                <col style="width: 11rem" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Название</th>
                  <th scope="col">Артикул</th>
                  <th scope="col">Цена</th>
                  <th scope="col">Остаток</th>
                  <th scope="col">Размеры</th>
                  <th scope="col">Категория</th>
                  <th scope="col" class="text-end">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <th scope="row">{{ product.id }}</th>
                  <td>{{ product.title }}</td>
                  <td>{{ product.sku }}</td>
                  <td>{{ formatCurrency(product.price) }}</td>
                  <td>{{ getTotalStock(product) }}</td>
                  <td>{{ summarizeSizes(product) }}</td>
                  <td>{{ product.category ? product.category.name : '—' }}</td>
                  <td class="text-end manager-table__actions">
                    <button class="btn btn-sm btn-outline-primary" @click="startEditProduct(product)">
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

        </section>

        <section class="manager-block">
          <div class="manager-block__header">
            <h2 class="manager-block__title">Заказы</h2>
            <div class="manager-block__actions">
              <button class="btn btn-outline-secondary" @click="refreshOrders" :disabled="ordersLoading">
                Обновить список
              </button>
              <button class="btn btn-primary" type="button" @click="openAddOrderModal">
                Добавить заказ
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table align-middle mb-0 manager-table">
              <colgroup>
                <col style="width: 5rem" />
                <col style="width: 18rem" />
                <col style="width: 11rem" />
                <col style="width: 14rem" />
                <col style="width: 10rem" />
                <col style="width: 12rem" />
                <col style="width: 8rem" />
                <col style="width: 13rem" />
                <col style="width: 12rem" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Покупатель</th>
                  <th scope="col">Статус</th>
                  <th scope="col">Отправка</th>
                  <th scope="col">Сумма</th>
                  <th scope="col">Способ оплаты</th>
                  <th scope="col">Позиций</th>
                  <th scope="col">Обновлён</th>
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
                  <td class="text-end manager-table__actions">
                    <button class="btn btn-sm btn-outline-primary" @click="startEditOrder(order)">
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

          <div v-if="orderForm" class="manager-form">
            <h3 class="manager-form__title">Редактирование заказа #{{ orderForm.id }}</h3>
            <form @submit.prevent="saveOrder" class="row g-3">
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
              <div class="col-12 d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                <button class="btn btn-primary" type="submit" :disabled="orderSaving">
                  Сохранить изменения
                </button>
                <button class="btn btn-outline-secondary" type="button" @click="cancelOrderEdit" :disabled="orderSaving">
                  Отменить
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
    </section>

  <GlassModal
    :visible="addProductModalVisible"
    max-width="920px"
    :prevent-close="creatingProduct"
    @close="closeAddProductModal"
  >
    <form class="form-dialog manager-modal" @submit.prevent="saveNewProduct">
      <header class="form-dialog__header">
        <div class="form-dialog__heading">
          <span class="form-dialog__icon form-dialog__icon--accent" aria-hidden="true">
            <PlusCircleIcon />
          </span>
          <div class="form-dialog__title-wrap">
            <DialogTitle id="add-product-modal-title" as="h2" class="form-dialog__title">
              Новый товар
            </DialogTitle>
            <p class="form-dialog__subtitle">
              Заполните карточку товара. Все поля можно отредактировать в любой момент.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="form-dialog__close"
          aria-label="Закрыть"
          :disabled="creatingProduct"
          @click="closeAddProductModal"
        >
          <XMarkIcon aria-hidden="true" />
        </button>
      </header>
      <section class="form-dialog__body manager-modal__body" aria-labelledby="add-product-modal-title">
        <div class="form-grid manager-form-grid">
          <div class="form-grid__item">
            <label for="newProductTitle" class="form-field__label">Название</label>
            <input
              id="newProductTitle"
              v-model="addProductForm.title"
              type="text"
              class="form-input"
              placeholder="Например, Толстовка Slipknot"
              required
              :disabled="creatingProduct"
            />
          </div>
          <div class="form-grid__item">
            <label for="newProductSku" class="form-field__label">Артикул</label>
            <input
              id="newProductSku"
              v-model="addProductForm.sku"
              type="text"
              class="form-input"
              placeholder="SKU-001"
              required
              :disabled="creatingProduct"
            />
          </div>
          <div class="form-grid__item">
            <label for="newProductPrice" class="form-field__label">Цена (₽)</label>
            <input
              id="newProductPrice"
              v-model="addProductForm.price"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              :required="!addProductHasSizes"
              :disabled="creatingProduct || addProductHasSizes"
              :placeholder="
                addProductHasSizes
                  ? 'Цена рассчитывается по минимальной цене среди размеров'
                  : 'Например, 2990'
              "
            />
          </div>
          <div class="form-grid__item">
            <label for="newProductCategory" class="form-field__label">Категория</label>
            <select
              id="newProductCategory"
              v-model="addProductForm.categoryId"
              class="form-input form-input--select"
              required
              :disabled="creatingProduct"
            >
              <option value="">Выберите категорию</option>
              <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-grid__item form-grid__item--full">
            <label for="newProductImageFile" class="form-field__label">Превью товара</label>
            <div class="image-upload">
              <div class="image-upload__controls">
                <input
                  id="newProductImageFile"
                  ref="addImageInputRef"
                  class="form-input form-input--file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="creatingProduct"
                  @change="onAddProductImageSelected"
                />
                <p class="image-upload__hint">
                  Поддерживаются JPEG, PNG или WebP до 5 МБ и с разрешением от 600×600 до 4000×4000 пикселей.
                </p>
                <div v-if="addProductImage.error" class="form-field__error">
                  {{ addProductImage.error }}
                </div>
                <div
                  v-if="addProductImage.previewUrl"
                  class="image-upload__preview"
                >
                  <img :src="addProductImage.previewUrl" alt="Превью нового товара" />
                  <div class="image-upload__preview-actions">
                    <button
                      type="button"
                      class="dialog-button dialog-button--ghost dialog-button--sm"
                      :disabled="creatingProduct"
                      @click="clearAddProductImage"
                    >
                      Очистить файл
                    </button>
                  </div>
                </div>
              </div>
              <div class="image-upload__divider">или вставьте ссылку</div>
              <input
                id="newProductImage"
                v-model="addProductForm.imageUrl"
                type="url"
                class="form-input"
                placeholder="https://"
                :disabled="creatingProduct || !!addProductImage.file"
              />
            </div>
          </div>
          <div class="form-grid__item form-grid__item--full">
            <label for="newProductDescription" class="form-field__label">Описание</label>
            <textarea
              id="newProductDescription"
              v-model="addProductForm.description"
              class="form-input form-input--textarea"
              rows="3"
              placeholder="Короткое описание товара"
              :disabled="creatingProduct"
            ></textarea>
          </div>
        </div>
        <div class="manager-sizes">
          <div class="manager-sizes__header">
            <h3 class="manager-sizes__title">Размеры и остатки</h3>
            <button
              type="button"
              class="dialog-button dialog-button--ghost dialog-button--sm"
              @click="addSizeRow(addProductForm.sizes)"
              :disabled="creatingProduct"
            >
              Добавить размер
            </button>
          </div>
          <div class="manager-sizes__list">
            <div
              v-for="(sizeRow, index) in addProductForm.sizes"
              :key="sizeRow.id ?? `new-product-size-${index}`"
              class="manager-sizes__row"
            >
              <div class="manager-sizes__field">
                <label class="form-field__label" :for="`newProductSizeName-${index}`">Размер</label>
                <input
                  :id="`newProductSizeName-${index}`"
                  v-model="sizeRow.size"
                  type="text"
                  class="form-input"
                  placeholder="Например, M"
                  maxlength="20"
                  :disabled="creatingProduct"
                />
              </div>
              <div class="manager-sizes__field">
                <label class="form-field__label" :for="`newProductSizePrice-${index}`">Цена (₽)</label>
                <input
                  :id="`newProductSizePrice-${index}`"
                  v-model="sizeRow.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input"
                  :disabled="creatingProduct"
                />
              </div>
              <div class="manager-sizes__field">
                <label class="form-field__label" :for="`newProductSizeStock-${index}`">Остаток</label>
                <input
                  :id="`newProductSizeStock-${index}`"
                  v-model="sizeRow.stock"
                  type="number"
                  min="0"
                  class="form-input"
                  :disabled="creatingProduct"
                />
              </div>
              <button
                type="button"
                class="dialog-button dialog-button--danger dialog-button--sm manager-sizes__remove"
                @click="removeSizeRow(addProductForm.sizes, index)"
                :disabled="creatingProduct"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </section>
      <footer class="form-dialog__footer">
        <button
          type="button"
          class="dialog-button dialog-button--ghost"
          :disabled="creatingProduct"
          @click="closeAddProductModal"
        >
          Отмена
        </button>
        <button type="submit" class="dialog-button dialog-button--primary" :disabled="creatingProduct">
          <span v-if="creatingProduct">Сохранение...</span>
          <span v-else>Сохранить</span>
        </button>
      </footer>
    </form>
  </GlassModal>

  <GlassModal
    :visible="editProductModalVisible"
    max-width="920px"
    :prevent-close="productSaving"
    @close="closeEditProductModal"
  >
    <form
      v-if="productForm"
      class="form-dialog manager-modal"
      @submit.prevent="saveProduct"
    >
      <header class="form-dialog__header">
        <div class="form-dialog__heading">
          <span class="form-dialog__icon" aria-hidden="true">
            <PencilSquareIcon />
          </span>
          <div class="form-dialog__title-wrap">
            <DialogTitle id="edit-product-modal-title" as="h2" class="form-dialog__title">
              Редактирование товара
            </DialogTitle>
            <p class="form-dialog__subtitle">
              Измените характеристики товара. Все изменения сохранятся после нажатия кнопки «Сохранить».
            </p>
          </div>
        </div>
        <button
          type="button"
          class="form-dialog__close"
          aria-label="Закрыть"
          :disabled="productSaving"
          @click="closeEditProductModal"
        >
          <XMarkIcon aria-hidden="true" />
        </button>
      </header>
      <section
        class="form-dialog__body manager-modal__body"
        aria-labelledby="edit-product-modal-title"
      >
        <div class="form-grid manager-form-grid">
          <div class="form-grid__item">
            <label for="editProductTitle" class="form-field__label">Название</label>
            <input
              id="editProductTitle"
              v-model="productForm.title"
              type="text"
              class="form-input"
              placeholder="Введите название"
              required
              :disabled="productSaving"
            />
          </div>
          <div class="form-grid__item">
            <label for="editProductSku" class="form-field__label">Артикул</label>
            <input
              id="editProductSku"
              v-model="productForm.sku"
              type="text"
              class="form-input"
              placeholder="SKU-001"
              required
              :disabled="productSaving"
            />
          </div>
          <div class="form-grid__item">
            <label for="editProductPrice" class="form-field__label">Цена (₽)</label>
            <input
              id="editProductPrice"
              v-model="productForm.price"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              :required="!productFormHasSizes"
              :disabled="productSaving || productFormHasSizes"
              :placeholder="
                productFormHasSizes
                  ? 'Цена определяется размерами'
                  : '0.00'
              "
            />
          </div>
          <div class="form-grid__item">
            <label for="editProductCategory" class="form-field__label">Категория</label>
            <select
              id="editProductCategory"
              v-model="productForm.categoryId"
              class="form-input form-input--select"
              required
              :disabled="productSaving"
            >
              <option value="">Выберите категорию</option>
              <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-grid__item form-grid__item--full">
            <label for="editProductImageFile" class="form-field__label">Превью товара</label>
            <div class="image-upload">
              <div class="image-upload__controls">
                <input
                  id="editProductImageFile"
                  ref="editImageInputRef"
                  class="form-input form-input--file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="productSaving"
                  @change="onEditProductImageSelected"
                />
                <p class="image-upload__hint">
                  Поддерживаются JPEG, PNG или WebP до 5 МБ и с разрешением от 600×600 до 4000×4000 пикселей.
                </p>
                <div v-if="editProductImage.error" class="form-field__error">
                  {{ editProductImage.error }}
                </div>
                <div
                  v-if="editProductImage.previewUrl || productForm.imageUrl"
                  class="image-upload__preview"
                >
                  <img
                    :src="editProductImage.previewUrl ?? productForm.imageUrl"
                    alt="Текущее превью товара"
                  />
                  <div class="image-upload__preview-actions">
                    <button
                      type="button"
                      class="dialog-button dialog-button--ghost dialog-button--sm"
                      :disabled="productSaving"
                      @click="clearEditProductImage"
                    >
                      Очистить файл
                    </button>
                    <button
                      type="button"
                      class="dialog-button dialog-button--ghost dialog-button--sm"
                      :disabled="productSaving || !productForm.imageUrl"
                      @click="removeExistingProductImage"
                    >
                      Удалить изображение
                    </button>
                  </div>
                </div>
              </div>
              <div class="image-upload__divider">или обновите ссылку</div>
              <input
                id="editProductImage"
                v-model="productForm.imageUrl"
                type="url"
                class="form-input"
                placeholder="https://"
                :disabled="productSaving || !!editProductImage.file"
              />
            </div>
          </div>
          <div class="form-grid__item form-grid__item--full">
            <label for="editProductDescription" class="form-field__label">Описание</label>
            <textarea
              id="editProductDescription"
              v-model="productForm.description"
              class="form-input form-input--textarea"
              rows="3"
              placeholder="Короткое описание товара"
              :disabled="productSaving"
            ></textarea>
          </div>
        </div>
        <div class="manager-sizes">
          <div class="manager-sizes__header">
            <h3 class="manager-sizes__title">Размеры и остатки</h3>
            <button
              type="button"
              class="dialog-button dialog-button--ghost dialog-button--sm"
              @click="addSizeRow(productForm.sizes)"
              :disabled="productSaving"
            >
              Добавить размер
            </button>
          </div>
          <div class="manager-sizes__list">
            <div
              v-for="(sizeRow, index) in productForm.sizes"
              :key="sizeRow.id ?? `product-size-${index}`"
              class="manager-sizes__row"
            >
              <div class="manager-sizes__field">
                <label class="form-field__label" :for="`editProductSizeName-${index}`">Размер</label>
                <input
                  :id="`editProductSizeName-${index}`"
                  v-model="sizeRow.size"
                  type="text"
                  class="form-input"
                  placeholder="Например, M"
                  maxlength="20"
                  :disabled="productSaving"
                />
              </div>
              <div class="manager-sizes__field">
                <label class="form-field__label" :for="`editProductSizePrice-${index}`">Цена, ₽</label>
                <input
                  :id="`editProductSizePrice-${index}`"
                  v-model="sizeRow.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input"
                  placeholder="0.00"
                  :disabled="productSaving"
                />
              </div>
              <div class="manager-sizes__field">
                <label class="form-field__label" :for="`editProductSizeStock-${index}`">Остаток</label>
                <input
                  :id="`editProductSizeStock-${index}`"
                  v-model="sizeRow.stock"
                  type="number"
                  min="0"
                  class="form-input"
                  :disabled="productSaving"
                />
              </div>
              <button
                type="button"
                class="dialog-button dialog-button--ghost dialog-button--danger manager-sizes__remove"
                :disabled="productSaving"
                @click="removeSizeRow(productForm.sizes, index)"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </section>
      <footer class="form-dialog__footer">
        <button
          type="button"
          class="dialog-button dialog-button--ghost"
          :disabled="productSaving"
          @click="closeEditProductModal"
        >
          Отмена
        </button>
        <button
          type="submit"
          class="dialog-button dialog-button--primary"
          :disabled="productSaving"
        >
          <span v-if="productSaving">Сохранение...</span>
          <span v-else>Сохранить</span>
        </button>
      </footer>
    </form>
  </GlassModal>

  <GlassModal
    :visible="addOrderModalVisible"
    max-width="820px"
    :prevent-close="creatingOrder"
    @close="closeAddOrderModal"
  >
    <form class="form-dialog manager-modal" @submit.prevent="saveNewOrder">
      <header class="form-dialog__header">
        <div class="form-dialog__heading">
          <span class="form-dialog__icon" aria-hidden="true">
            <ClipboardDocumentListIcon />
          </span>
          <div class="form-dialog__title-wrap">
            <DialogTitle id="add-order-modal-title" as="h2" class="form-dialog__title">
              Новый заказ
            </DialogTitle>
            <p class="form-dialog__subtitle">
              Укажите клиента, статусы и сумму заказа. Эти параметры можно изменить позже.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="form-dialog__close"
          aria-label="Закрыть"
          :disabled="creatingOrder"
          @click="closeAddOrderModal"
        >
          <XMarkIcon aria-hidden="true" />
        </button>
      </header>
      <section class="form-dialog__body manager-modal__body" aria-labelledby="add-order-modal-title">
        <div class="form-grid manager-form-grid">
          <div class="form-grid__item">
            <label for="newOrderUser" class="form-field__label">Покупатель</label>
            <select
              id="newOrderUser"
              v-model="addOrderForm.userId"
              class="form-input form-input--select"
              required
              :disabled="creatingOrder || !orderCustomers.length"
            >
              <option value="">Выберите покупателя</option>
              <option v-for="customer in orderCustomers" :key="customer.id" :value="String(customer.id)">
                {{ customer.name }} • {{ customer.email }}
              </option>
            </select>
          </div>
          <div class="form-grid__item">
            <label for="newOrderStatus" class="form-field__label">Статус</label>
            <select
              id="newOrderStatus"
              v-model="addOrderForm.statusId"
              class="form-input form-input--select"
              required
              :disabled="creatingOrder"
            >
              <option value="">Выберите статус</option>
              <option v-for="status in orderStatuses" :key="status.id" :value="String(status.id)">
                {{ status.name }}
              </option>
            </select>
          </div>
          <div class="form-grid__item">
            <label for="newOrderShipping" class="form-field__label">Статус отправки</label>
            <select
              id="newOrderShipping"
              v-model="addOrderForm.shippingStatus"
              class="form-input form-input--select"
              required
              :disabled="creatingOrder"
            >
              <option v-for="option in shippingStatusOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
          <div class="form-grid__item">
            <label for="newOrderTotal" class="form-field__label">Сумма (₽)</label>
            <input
              id="newOrderTotal"
              v-model="addOrderForm.totalAmount"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              required
              :disabled="creatingOrder"
            />
          </div>
          <div class="form-grid__item">
            <label for="newOrderPayment" class="form-field__label">Способ оплаты</label>
            <input
              id="newOrderPayment"
              v-model="addOrderForm.paymentMethod"
              type="text"
              class="form-input"
              placeholder="Например, Банковская карта"
              :disabled="creatingOrder"
            />
          </div>
          <div class="form-grid__item">
            <label for="newOrderAddress" class="form-field__label">ID адреса (опционально)</label>
            <input
              id="newOrderAddress"
              v-model="addOrderForm.addressId"
              type="number"
              min="1"
              class="form-input"
              placeholder="Укажите при необходимости"
              :disabled="creatingOrder"
            />
          </div>
          <div class="form-grid__item form-grid__item--full">
            <label for="newOrderComment" class="form-field__label">Комментарий</label>
            <textarea
              id="newOrderComment"
              v-model="addOrderForm.comment"
              class="form-input form-input--textarea"
              rows="3"
              placeholder="Дополнительная информация для сборки или доставки"
              :disabled="creatingOrder"
            ></textarea>
          </div>
        </div>
        <div v-if="!orderCustomers.length" class="manager-modal__empty">
          Нет доступных покупателей. Добавьте пользователя в разделе администрирования.
        </div>
      </section>
      <footer class="form-dialog__footer">
        <button
          type="button"
          class="dialog-button dialog-button--ghost"
          :disabled="creatingOrder"
          @click="closeAddOrderModal"
        >
          Отмена
        </button>
        <button
          type="submit"
          class="dialog-button dialog-button--primary"
          :disabled="creatingOrder || !orderCustomers.length"
        >
          <span v-if="creatingOrder">Сохранение...</span>
          <span v-else>Сохранить</span>
        </button>
      </footer>
    </form>
  </GlassModal>

  </div>
</template>

<script setup lang="ts">
import { DialogTitle } from '@headlessui/vue';
import { ClipboardDocumentListIcon, PlusCircleIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/vue/24/outline';
import { computed, onMounted, reactive, ref } from 'vue';
import GlassModal from '../components/GlassModal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  type ProductDto,
  type ProductSizePayload,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../api/products';
import { fetchCategories, type CategoryDto } from '../api/categories';
import {
  fetchOrders,
  fetchOrderStatuses,
  fetchOrderCustomers,
  createOrder,
  updateOrder,
  deleteOrder,
  type OrderDto,
  type OrderStatusDto,
  type OrderCustomerDto,
  type CreateOrderPayload,
  type UpdateOrderPayload,
} from '../api/orders';
import { extractErrorMessage } from '../api/http';

interface EditableProductSize {
  id: number | null;
  size: string;
  price: string;
  stock: string;
}

interface ProductFormState {
  id: number;
  title: string;
  description: string;
  price: string;
  sku: string;
  imageUrl: string;
  categoryId: string;
  sizes: EditableProductSize[];
}

interface NewProductFormState {
  title: string;
  description: string;
  price: string;
  sku: string;
  imageUrl: string;
  categoryId: string;
  sizes: EditableProductSize[];
}

interface ImageSelectionState {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  width: number | null;
  height: number | null;
}

interface OrderFormState {
  id: number;
  statusId: string;
  shippingStatus: string;
  totalAmount: string;
  paymentMethod: string;
  comment: string;
}

interface NewOrderFormState {
  userId: string;
  statusId: string;
  shippingStatus: string;
  totalAmount: string;
  paymentMethod: string;
  comment: string;
  addressId: string;
}

const products = ref<ProductDto[]>([]);
const orders = ref<OrderDto[]>([]);
const categories = ref<CategoryDto[]>([]);
const orderStatuses = ref<OrderStatusDto[]>([]);
const orderCustomers = ref<OrderCustomerDto[]>([]);
const shippingStatusOptions = ref<string[]>(['Готовится к отправке', 'В пути', 'Доставлен']);

const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const PRODUCT_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PRODUCT_IMAGE_MIN_WIDTH = 600;
const PRODUCT_IMAGE_MIN_HEIGHT = 600;
const PRODUCT_IMAGE_MAX_WIDTH = 4000;
const PRODUCT_IMAGE_MAX_HEIGHT = 4000;

const initialLoading = ref(false);
const productsLoading = ref(false);
const ordersLoading = ref(false);
const productSaving = ref(false);
const orderSaving = ref(false);
const creatingProduct = ref(false);
const creatingOrder = ref(false);

const globalError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const productForm = ref<ProductFormState | null>(null);
const orderForm = ref<OrderFormState | null>(null);
const addProductModalVisible = ref(false);
const editProductModalVisible = ref(false);
const addOrderModalVisible = ref(false);

const addImageInputRef = ref<HTMLInputElement | null>(null);
const editImageInputRef = ref<HTMLInputElement | null>(null);

const addProductImage = reactive<ImageSelectionState>({
  file: null,
  previewUrl: null,
  error: null,
  width: null,
  height: null,
});

const editProductImage = reactive<ImageSelectionState>({
  file: null,
  previewUrl: null,
  error: null,
  width: null,
  height: null,
});

const addProductForm = reactive<NewProductFormState>({
  title: '',
  description: '',
  price: '',
  sku: '',
  imageUrl: '',
  categoryId: '',
  sizes: [],
});
const addOrderForm = reactive<NewOrderFormState>({
  userId: '',
  statusId: '',
  shippingStatus: shippingStatusOptions.value[0] ?? 'Готовится к отправке',
  totalAmount: '',
  paymentMethod: '',
  comment: '',
  addressId: '',
});

const hasFilledSizeRows = (rows: EditableProductSize[]): boolean =>
  rows.some((size) => size.size.trim().length > 0);

const addProductHasSizes = computed(() => hasFilledSizeRows(addProductForm.sizes));
const productFormHasSizes = computed(() =>
  productForm.value ? hasFilledSizeRows(productForm.value.sizes) : false,
);

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

const toEditableSizes = (sizes: ProductDto['sizes']): EditableProductSize[] => {
  if (!sizes.length) {
    return [{ id: null, size: '', price: '', stock: '' }];
  }

  return sizes.map((size) => ({
    id: size.id,
    size: size.size,
    price: size.price.toString(),
    stock: size.stock.toString(),
  }));
};

const buildSizePayload = (sizes: EditableProductSize[]): ProductSizePayload[] => {
  const payload: ProductSizePayload[] = [];
  const seen = new Set<string>();

  for (const size of sizes) {
    const trimmed = size.size.trim();
    if (!trimmed) {
      continue;
    }

    const normalizedName = trimmed.toLowerCase();
    if (seen.has(normalizedName)) {
      throw new Error(`Размер "${trimmed}" указан несколько раз.`);
    }

    const priceValue = Number(size.price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      throw new Error(`Некорректная цена для размера "${trimmed}".`);
    }

    const stockValue = Number(size.stock);
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      throw new Error(
        `Некорректное значение остатка для размера "${trimmed}".`,
      );
    }

    seen.add(normalizedName);
    payload.push({
      size: trimmed,
      price: Number(priceValue.toFixed(2)),
      stock: Math.floor(stockValue),
    });
  }

  return payload;
};

const calculateBasePriceForSubmission = (
  priceInput: string,
  sizes: ProductSizePayload[],
): number => {
  if (sizes.length) {
    const validPrices = sizes
      .map((size) => size.price)
      .filter((price) => Number.isFinite(price) && price > 0);

    if (!validPrices.length) {
      throw new Error('Укажите корректные цены для размеров товара.');
    }

    return Number(Math.min(...validPrices).toFixed(2));
  }

  const normalizedPrice = Number(priceInput);
  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    throw new Error('Укажите корректную цену товара.');
  }

  return Number(normalizedPrice.toFixed(2));
};

const resetImageState = (state: ImageSelectionState) => {
  state.file = null;
  state.previewUrl = null;
  state.error = null;
  state.width = null;
  state.height = null;
};

const resetFileInput = (input: HTMLInputElement | null) => {
  if (input) {
    input.value = '';
  }
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Не удалось получить превью изображения.'));
      }
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл изображения.'));
    reader.readAsDataURL(file);
  });

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Не удалось определить размеры изображения.'));
    };
    image.src = objectUrl;
  });

const prepareImageSelection = async (
  file: File,
  state: ImageSelectionState,
): Promise<boolean> => {
  state.error = null;

  if (!PRODUCT_IMAGE_ALLOWED_TYPES.includes(file.type)) {
    state.error = 'Поддерживаются только изображения JPEG, PNG или WebP.';
    return false;
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    state.error = 'Размер файла превышает допустимые 5 МБ.';
    return false;
  }

  let dimensions: { width: number; height: number };
  try {
    dimensions = await getImageDimensions(file);
  } catch (error) {
    state.error = error instanceof Error ? error.message : 'Не удалось обработать изображение.';
    return false;
  }

  const { width, height } = dimensions;

  if (width < PRODUCT_IMAGE_MIN_WIDTH || height < PRODUCT_IMAGE_MIN_HEIGHT) {
    state.error = `Минимальное разрешение — ${PRODUCT_IMAGE_MIN_WIDTH}×${PRODUCT_IMAGE_MIN_HEIGHT} пикселей.`;
    return false;
  }

  if (width > PRODUCT_IMAGE_MAX_WIDTH || height > PRODUCT_IMAGE_MAX_HEIGHT) {
    state.error = `Максимальное разрешение — ${PRODUCT_IMAGE_MAX_WIDTH}×${PRODUCT_IMAGE_MAX_HEIGHT} пикселей.`;
    return false;
  }

  let previewUrl: string;
  try {
    previewUrl = await readFileAsDataUrl(file);
  } catch (error) {
    state.error = error instanceof Error ? error.message : 'Не удалось подготовить превью.';
    return false;
  }

  state.file = file;
  state.previewUrl = previewUrl;
  state.width = width;
  state.height = height;
  return true;
};

const onAddProductImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    clearAddProductImage();
    return;
  }

  const success = await prepareImageSelection(file, addProductImage);
  if (!success) {
    resetFileInput(input);
    return;
  }

  addProductForm.imageUrl = '';
};

const onEditProductImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    clearEditProductImage();
    return;
  }

  const success = await prepareImageSelection(file, editProductImage);
  if (!success) {
    resetFileInput(input);
    return;
  }

  if (productForm.value) {
    productForm.value.imageUrl = '';
  }
};

const clearAddProductImage = () => {
  resetImageState(addProductImage);
  resetFileInput(addImageInputRef.value);
};

const clearEditProductImage = () => {
  resetImageState(editProductImage);
  resetFileInput(editImageInputRef.value);
};

const removeExistingProductImage = () => {
  if (!productForm.value) {
    return;
  }
  productForm.value.imageUrl = '';
  if (!editProductImage.file) {
    clearEditProductImage();
  }
};

const addSizeRow = (rows: EditableProductSize[]) => {
  rows.push({ id: null, size: '', price: '', stock: '' });
};

const removeSizeRow = (rows: EditableProductSize[], index: number) => {
  if (index < 0 || index >= rows.length) {
    return;
  }

  rows.splice(index, 1);
};

const getTotalStock = (product: ProductDto): number =>
  product.sizes.reduce((sum, size) => sum + size.stock, 0);

const summarizeSizes = (product: ProductDto): string => {
  if (!product.sizes.length) {
    return '—';
  }

  return product.sizes
    .map(
      (size) =>
        `${size.size} — ${size.stock} шт. (${formatCurrency(size.price)})`,
    )
    .join(', ');
};

const getDefaultShippingStatus = () => shippingStatusOptions.value[0] ?? 'Готовится к отправке';
const getDefaultStatusId = () => (orderStatuses.value.length ? String(orderStatuses.value[0].id) : '');

const resetAddProductForm = () => {
  Object.assign(addProductForm, {
    title: '',
    description: '',
    price: '',
    sku: '',
    imageUrl: '',
    categoryId: '',
    sizes: [{ id: null, size: '', price: '', stock: '' }],
  });
  clearAddProductImage();
};

const resetAddOrderForm = () => {
  Object.assign(addOrderForm, {
    userId: '',
    statusId: getDefaultStatusId(),
    shippingStatus: getDefaultShippingStatus(),
    totalAmount: '',
    paymentMethod: '',
    comment: '',
    addressId: '',
  });
};

const toggleAddProductModal = (visible: boolean) => {
  if (visible) {
    resetAddProductForm();
  } else {
    clearAddProductImage();
  }
  addProductModalVisible.value = visible;
};

const closeEditProductModal = () => {
  editProductModalVisible.value = false;
  clearEditProductImage();
  productForm.value = null;
};

const toggleAddOrderModal = (visible: boolean) => {
  if (visible) {
    resetAddOrderForm();
  }
  addOrderModalVisible.value = visible;
};

const refreshOrderCustomers = async (silent = false) => {
  try {
    orderCustomers.value = await fetchOrderCustomers();
  } catch (error) {
    if (!silent) {
      showError(error);
    }
  }
};

const openAddProductModal = () => {
  toggleAddProductModal(true);
};

const closeAddProductModal = () => {
  toggleAddProductModal(false);
};

const openAddOrderModal = () => {
  toggleAddOrderModal(true);
  void refreshOrderCustomers(true);
};

const closeAddOrderModal = () => {
  toggleAddOrderModal(false);
};

const loadInitialData = async () => {
  try {
    initialLoading.value = true;
    globalError.value = null;
    const [
      productsData,
      ordersData,
      categoriesData,
      statusesData,
      customersData,
    ] = await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchCategories(),
      fetchOrderStatuses(),
      fetchOrderCustomers(),
    ]);
    products.value = productsData;
    orders.value = ordersData;
    categories.value = categoriesData;
    orderStatuses.value = statusesData;
    orderCustomers.value = customersData;
    orders.value.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
    resetAddOrderForm();
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
    showSuccess('Список товаров обновлён.');
  } catch (error) {
    showError(error);
  } finally {
    productsLoading.value = false;
  }
};

const refreshOrders = async () => {
  try {
    ordersLoading.value = true;
    orders.value = await fetchOrders();
    orders.value.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
    showSuccess('Список заказов обновлён.');
    await refreshOrderCustomers(true);
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
    imageUrl: product.imageUrl ?? '',
    categoryId: product.category ? String(product.category.id) : '',
    sizes: toEditableSizes(product.sizes),
  };
  clearEditProductImage();
  editProductModalVisible.value = true;
};

const saveNewProduct = async () => {
  if (
    !addProductForm.title ||
    !addProductForm.sku ||
    !addProductForm.categoryId
  ) {
    return;
  }

  let sizePayload: ProductSizePayload[] = [];
  try {
    sizePayload = buildSizePayload(addProductForm.sizes);
  } catch (error) {
    showError(error);
    return;
  }

  let basePrice: number;
  try {
    basePrice = calculateBasePriceForSubmission(addProductForm.price, sizePayload);
  } catch (error) {
    showError(error);
    return;
  }
  addProductForm.price = basePrice.toFixed(2);

  try {
    creatingProduct.value = true;
    let imageUrl: string | undefined;

    if (addProductImage.file) {
      try {
        const uploaded = await uploadProductImage(addProductImage.file);
        imageUrl = uploaded.url;
      } catch (error) {
        showError(error);
        return;
      }
    } else if (addProductForm.imageUrl.trim()) {
      imageUrl = addProductForm.imageUrl.trim();
    }

    const payload: CreateProductPayload = {
      title: addProductForm.title,
      description: addProductForm.description ? addProductForm.description : undefined,
      price: basePrice,
      sku: addProductForm.sku,
      imageUrl,
      categoryId: Number(addProductForm.categoryId),
      sizes: sizePayload.length ? sizePayload : undefined,
    };
    await createProduct(payload);
    products.value = await fetchProducts();
    showSuccess('Новый товар добавлен.');
    toggleAddProductModal(false);
  } catch (error) {
    showError(error);
  } finally {
    creatingProduct.value = false;
  }
};

const saveProduct = async () => {
  const currentForm = productForm.value;
  if (!currentForm) {
    return;
  }
  let sizePayload: ProductSizePayload[] = [];
  try {
    sizePayload = buildSizePayload(currentForm.sizes);
  } catch (error) {
    showError(error);
    return;
  }
  let basePrice: number;
  try {
    basePrice = calculateBasePriceForSubmission(
      currentForm.price,
      sizePayload,
    );
  } catch (error) {
    showError(error);
    return;
  }
  currentForm.price = basePrice.toFixed(2);
  try {
    productSaving.value = true;
    let imageUrl: string | undefined;

    if (editProductImage.file) {
      try {
        const uploaded = await uploadProductImage(editProductImage.file);
        imageUrl = uploaded.url;
      } catch (error) {
        showError(error);
        return;
      }
    } else if (currentForm.imageUrl !== undefined) {
      const trimmed = currentForm.imageUrl.trim();
      imageUrl = trimmed ? trimmed : '';
    }

    const payload: UpdateProductPayload = {
      title: currentForm.title,
      description: currentForm.description || undefined,
      price: basePrice,
      sku: currentForm.sku,
      imageUrl,
      categoryId: currentForm.categoryId
        ? Number(currentForm.categoryId)
        : undefined,
      sizes: sizePayload,
    };
    await updateProduct(currentForm.id, payload);
    await refreshProducts();
    closeEditProductModal();
    showSuccess('Товар обновлён.');
  } catch (error) {
    showError(error);
  } finally {
    productSaving.value = false;
  }
};

const removeProduct = async (product: ProductDto) => {
  try {
    await deleteProduct(product.id);
    await refreshProducts();
    showSuccess('Товар удалён.');
  } catch (error) {
    showError(error);
  }
};

const startEditOrder = (order: OrderDto) => {
  orderForm.value = {
    id: order.id,
    statusId: order.status ? String(order.status.id) : '',
    shippingStatus: order.shippingStatus ?? shippingStatusOptions.value[0],
    totalAmount: order.totalAmount.toString(),
    paymentMethod: order.paymentMethod ?? '',
    comment: order.comment ?? '',
  };
};

const cancelOrderEdit = () => {
  orderForm.value = null;
};

const saveNewOrder = async () => {
  if (!addOrderForm.userId || !addOrderForm.statusId || addOrderForm.totalAmount === '') {
    return;
  }

  try {
    creatingOrder.value = true;
    const payload: CreateOrderPayload = {
      userId: Number(addOrderForm.userId),
      statusId: Number(addOrderForm.statusId),
      totalAmount: Number(addOrderForm.totalAmount),
      paymentMethod: addOrderForm.paymentMethod ? addOrderForm.paymentMethod : undefined,
      comment: addOrderForm.comment ? addOrderForm.comment : undefined,
      shippingStatus: addOrderForm.shippingStatus ? addOrderForm.shippingStatus : undefined,
      addressId: addOrderForm.addressId ? Number(addOrderForm.addressId) : undefined,
    };
    const createdOrder = await createOrder(payload);
    ensureShippingStatusOption(createdOrder.shippingStatus);
    orders.value = await fetchOrders();
    orders.value.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
    showSuccess('Заказ создан.');
    toggleAddOrderModal(false);
  } catch (error) {
    showError(error);
  } finally {
    creatingOrder.value = false;
  }
};

const saveOrder = async () => {
  if (!orderForm.value) {
    return;
  }
  try {
    orderSaving.value = true;
    const payload: UpdateOrderPayload = {
      statusId: Number(orderForm.value.statusId),
      shippingStatus: orderForm.value.shippingStatus,
      totalAmount: Number(orderForm.value.totalAmount),
      paymentMethod: orderForm.value.paymentMethod || undefined,
      comment: orderForm.value.comment || undefined,
    };
    await updateOrder(orderForm.value.id, payload);
    await refreshOrders();
    orderForm.value = null;
    showSuccess('Заказ обновлён.');
  } catch (error) {
    showError(error);
  } finally {
    orderSaving.value = false;
  }
};

const removeOrder = async (order: OrderDto) => {
  try {
    await deleteOrder(order.id);
    await refreshOrders();
    showSuccess('Заказ удалён.');
  } catch (error) {
    showError(error);
  }
};

onMounted(() => {
  void loadInitialData();
});
</script>

<style scoped>
.manager-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.manager-grid {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 3vw, 3rem);
}

.manager-block {
  padding: clamp(1.75rem, 3vw, 2.5rem);
  border-radius: calc(var(--radius-lg) * 1.1);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.manager-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.manager-block__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.manager-block__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.manager-table {
  table-layout: fixed;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.manager-table th,
.manager-table td {
  vertical-align: middle;
  border-color: var(--color-surface-border);
  font-variant-numeric: tabular-nums;
}

.manager-table th {
  font-weight: 600;
  color: var(--color-text-muted);
}

.manager-table td:not(:nth-child(2)) {
  white-space: nowrap;
}

.manager-table td:nth-child(2) {
  max-width: 18rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manager-table__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.manager-table__actions :deep(.btn) {
  margin: 0;
}

.manager-form {
  padding: clamp(1.5rem, 2.5vw, 2rem);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.manager-form__title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.manager-modal {
  gap: clamp(1.25rem, 2vw, 1.75rem);
}

.manager-modal__body {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2vw, 1.75rem);
}

.form-input--file {
  display: block;
  width: 100%;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius-md, 0.9rem);
  border: 1px dashed color-mix(in srgb, var(--color-accent) 35%, var(--color-surface-border));
  background: color-mix(in srgb, var(--color-surface) 85%, transparent);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition-base), background-color var(--transition-base);
}

.form-input--file::file-selector-button {
  margin-right: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: calc(var(--radius-md, 0.9rem) * 0.85);
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, var(--color-surface-border));
  background: color-mix(in srgb, var(--color-accent) 25%, transparent);
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.form-input--file:hover {
  border-color: color-mix(in srgb, var(--color-accent) 55%, var(--color-surface-border));
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
}

.form-input--file:hover::file-selector-button {
  border-color: color-mix(in srgb, var(--color-accent) 65%, var(--color-surface-border));
  background: color-mix(in srgb, var(--color-accent) 35%, transparent);
}

.image-upload {
  display: grid;
  gap: 0.75rem;
}

.image-upload__controls {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.image-upload__hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.image-upload__preview {
  display: grid;
  gap: 0.5rem;
  padding: 0.85rem;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-surface-border) 65%, transparent);
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
}

.image-upload__preview img {
  width: min(260px, 100%);
  border-radius: calc(var(--radius-lg) * 0.85);
  object-fit: cover;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
}

.image-upload__preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.image-upload__divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(--color-text-muted) 85%, rgba(255, 255, 255, 0.4));
}

.image-upload__divider::before,
.image-upload__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--color-surface-border) 55%, transparent);
}

.manager-form-grid {
  gap: clamp(1rem, 2vw, 1.35rem);
}

.manager-sizes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: clamp(1rem, 2.5vw, 1.35rem);
  border-radius: calc(var(--radius-lg) * 1.1);
  border: 1px dashed color-mix(in srgb, var(--color-accent) 38%, transparent);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--color-surface-alt) 88%, transparent) 0%,
      color-mix(in srgb, var(--color-surface) 78%, transparent) 100%);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-surface-border) 65%, transparent);
}

.manager-sizes__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.manager-sizes__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.manager-sizes__list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.manager-sizes__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 0.9rem;
  align-items: end;
}

.manager-sizes__field {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.manager-sizes__remove {
  align-self: stretch;
  min-width: 0;
}

.manager-modal__empty {
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px dashed color-mix(in srgb, var(--color-accent) 45%, transparent);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 768px) {
  .manager-sizes__row {
    grid-template-columns: 1fr;
  }

  .manager-sizes__remove {
    justify-self: stretch;
  }
}

@media (max-width: 575.98px) {
  .manager-block__header :deep(.btn) {
    width: 100%;
  }
}
</style>
