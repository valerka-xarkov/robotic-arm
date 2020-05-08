export function debounce<U extends []>(fn: (...args: U) => any, time: number, maxTime: number): (...args: U) => any {
  let timeout: number;
  let maxTimeout: number;

  const res = (...args: U) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      fn.apply(null, args);
      clearTimeout(maxTimeout);
      maxTimeout = null;
    }, time);
    if (!maxTimeout) {
      maxTimeout = window.setTimeout(() => {
        fn.apply(null, args);
        maxTimeout = null;
        clearTimeout(timeout);
      }, maxTime);
    }
  };

  return res;
}
