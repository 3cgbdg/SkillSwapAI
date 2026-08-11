export function withViewTransition(callback: () => void) {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    (
      document as Document & {
        startViewTransition: (cb: () => void) => void;
      }
    ).startViewTransition(callback);
    return;
  }
  callback();
}
