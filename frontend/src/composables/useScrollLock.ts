import { onBeforeUnmount, watch, type Ref } from 'vue';

const BODY_LOCK_CLASS = 'modal-open';
let lockCounter = 0;
let storedOverflow = '';
let storedPaddingRight = '';

const getScrollbarWidth = (): number => {
  if (typeof window === 'undefined') {
    return 0;
  }
  return window.innerWidth - document.documentElement.clientWidth;
};

const applyScrollLock = () => {
  const { body } = document;
  if (!lockCounter) {
    storedOverflow = body.style.overflow;
    storedPaddingRight = body.style.paddingRight;
    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    body.style.overflow = 'hidden';
    body.classList.add(BODY_LOCK_CLASS);
  }
  lockCounter += 1;
};

const releaseScrollLock = () => {
  const { body } = document;
  if (lockCounter <= 0) {
    return;
  }
  lockCounter -= 1;
  if (lockCounter === 0) {
    body.classList.remove(BODY_LOCK_CLASS);
    body.style.overflow = storedOverflow;
    body.style.paddingRight = storedPaddingRight;
    storedOverflow = '';
    storedPaddingRight = '';
  }
};

export const useScrollLock = (visible: Ref<boolean>) => {
  const stop = watch(
    visible,
    (isVisible) => {
      if (typeof document === 'undefined') {
        return;
      }
      if (isVisible) {
        applyScrollLock();
      } else {
        releaseScrollLock();
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stop();
    if (visible.value) {
      releaseScrollLock();
    }
  });
};
