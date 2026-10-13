/**
 * useKeyPress tests
 *
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useKeyPress } from "@/_hooks/useKeyPress";

function press(key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key, cancelable: true, ...init });
  window.dispatchEvent(event);
  return event;
}

describe("useKeyPress", () => {
  it("calls the callback and prevents default when the key matches", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress({ key: "Escape" }, callback));

    const event = press("Escape");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("matches keys case-insensitively", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress({ key: "k" }, callback));

    press("K");

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress({ key: "Escape" }, callback));

    const event = press("Enter");

    expect(callback).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("requires the configured modifiers", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress({ key: "k", metaKey: true }, callback));

    press("k");
    expect(callback).not.toHaveBeenCalled();

    press("k", { metaKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["ctrlKey", { ctrlKey: true }],
    ["shiftKey", { shiftKey: true }],
    ["altKey", { altKey: true }],
  ] as const)("requires %s when configured", (_name, modifier) => {
    const callback = jest.fn();
    renderHook(() => useKeyPress({ key: "k", ...modifier }, callback));

    press("k");
    expect(callback).not.toHaveBeenCalled();

    press("k", modifier);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not fire when an unexpected modifier is held", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress({ key: "k" }, callback));

    press("k", { metaKey: true });
    press("k", { shiftKey: true });

    expect(callback).not.toHaveBeenCalled();
  });

  it("uses the latest callback after a rerender", () => {
    const first = jest.fn();
    const second = jest.fn();
    const config = { key: "Escape" };
    const { rerender } = renderHook(({ cb }) => useKeyPress(config, cb), {
      initialProps: { cb: first },
    });

    rerender({ cb: second });
    press("Escape");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useKeyPress({ key: "Escape" }, callback));

    unmount();
    press("Escape");

    expect(callback).not.toHaveBeenCalled();
  });
});
