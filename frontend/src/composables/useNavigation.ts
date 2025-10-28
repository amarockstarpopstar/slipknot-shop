import { isNavigationFailure, NavigationFailureType, type RouteLocationRaw, useRouter } from 'vue-router';

/**
 * useNavigation provides guarded helpers for SPA navigation without full reloads.
 */
export function useNavigation() {
  const router = useRouter();

  const normalizeResult = (failure: unknown) => {
    if (!failure) {
      return;
    }
    if (
      isNavigationFailure(failure, NavigationFailureType.duplicated) ||
      isNavigationFailure(failure, NavigationFailureType.cancelled)
    ) {
      console.info('Navigation skipped', failure);
      return;
    }
    console.warn('Navigation finished with a failure', failure);
  };

  const safePush = async (location: RouteLocationRaw) => {
    try {
      const failure = await router.push(location);
      normalizeResult(failure);
    } catch (error) {
      console.error('Navigation error', error);
    }
  };

  const safeReplace = async (location: RouteLocationRaw) => {
    try {
      const failure = await router.replace(location);
      normalizeResult(failure);
    } catch (error) {
      console.error('Navigation replace error', error);
    }
  };

  const goHome = async () => safePush({ name: 'home' });
  const goToCart = async () => safePush({ name: 'cart' });
  const goToCheckout = async () => safePush({ name: 'checkout-payment' });
  const goToProfile = async () => safePush({ name: 'profile' });
  const goToOrders = async () => safePush({ name: 'orders-history' });

  return {
    safePush,
    safeReplace,
    goHome,
    goToCart,
    goToCheckout,
    goToProfile,
    goToOrders,
  };
}
