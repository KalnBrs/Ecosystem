/**
 * store tests
 *
 * Verifies the Redux store shape after the migration of server state
 * (nodes) to TanStack Query. Redux now only owns local/UI state.
 */

import { makeStore } from "@/store/store";

describe("makeStore", () => {
  it("creates a store with exactly the auth, focus, morning3, and dailyReset reducers", () => {
    const store = makeStore();

    expect(Object.keys(store.getState()).sort()).toEqual([
      "auth",
      "dailyReset",
      "focus",
      "morning3",
    ]);
  });

  it("does not include a nodes reducer (server state now lives in TanStack Query)", () => {
    const store = makeStore();

    expect(store.getState()).not.toHaveProperty("nodes");
  });

  it("initializes auth state", () => {
    const store = makeStore();

    expect(store.getState().auth).toEqual({
      status: "idle",
      user: null,
      error: null,
      initialized: false,
    });
  });

  it("initializes focus state", () => {
    const store = makeStore();

    expect(store.getState().focus).toEqual({
      activeTaskId: null,
      mode: null,
      timerDurationMinutes: null,
      startedAt: null,
      elapsedSeconds: 0,
      isRunning: false,
    });
  });

  it("initializes morning3 state", () => {
    const store = makeStore();

    expect(store.getState().morning3).toEqual({
      picksLockedForDate: null,
      pickedTaskIds: [],
      selectionComplete: false,
    });
  });

  it("initializes dailyReset state", () => {
    const store = makeStore();

    expect(store.getState().dailyReset).toEqual({
      isActive: false,
      pendingTaskIds: [],
      currentIndex: 0,
      lastResetDate: null,
    });
  });
});
