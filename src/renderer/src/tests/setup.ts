import '@testing-library/jest-dom'

// jsdom doesn't ship ResizeObserver. useVirtualRows (and any future hook
// that observes element size) needs it on import; install a no-op stub
// globally so component tests that render those hooks don't crash.
if (typeof globalThis.ResizeObserver === 'undefined') {
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
}
