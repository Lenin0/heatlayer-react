import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(_callback: ResizeObserverCallback) {}
}

globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver;