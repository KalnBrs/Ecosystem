/**
 * Slice reducer tests
 *
 * The auth/focus/morning3/dailyReset slices currently define no reducers, so
 * these verify the initial state and that unknown actions leave state untouched.
 */

import authReducer, { authSlice } from "@/store/slices/authSlice";
import focusReducer, { focusSlice } from "@/store/slices/focusSlice";
import morning3Reducer, { morning3Slice } from "@/store/slices/morning3Slice";
import {
  selectMorning3,
  selectPickedTaskIds,
  selectPicksLockedForDate,
  selectMorning3SelectionComplete,
} from "@/store/slices/morning3Selectors";
import dailyResetReducer, { dailyResetSlice } from "@/store/slices/dailyResetSlice";

const unknownAction = { type: "unknown/action" };

describe("authSlice", () => {
  it("has the expected name", () => {
    expect(authSlice.name).toBe("auth");
  });

  it("returns the initial state", () => {
    expect(authReducer(undefined, unknownAction)).toEqual({
      status: "idle",
      user: null,
      error: null,
      initialized: false,
    });
  });

  it("ignores unknown actions", () => {
    const state = {
      status: "authenticated" as const,
      user: { id: "u1", email: "a@b.com", name: "A" },
      error: null,
      initialized: true,
    };
    expect(authReducer(state, unknownAction)).toBe(state);
  });
});

describe("focusSlice", () => {
  it("has the expected name", () => {
    expect(focusSlice.name).toBe("focus");
  });

  it("returns the initial state", () => {
    expect(focusReducer(undefined, unknownAction)).toEqual({
      activeTaskId: null,
      mode: null,
      timerDurationMinutes: null,
      startedAt: null,
      elapsedSeconds: 0,
      isRunning: false,
    });
  });

  it("ignores unknown actions", () => {
    const state = {
      activeTaskId: "t1",
      mode: "countdown" as const,
      timerDurationMinutes: 25,
      startedAt: "2026-01-01T00:00:00.000Z",
      elapsedSeconds: 10,
      isRunning: true,
    };
    expect(focusReducer(state, unknownAction)).toBe(state);
  });
});

describe("morning3Slice", () => {
  it("has the expected name", () => {
    expect(morning3Slice.name).toBe("morning3");
  });

  it("returns the initial state", () => {
    expect(morning3Reducer(undefined, unknownAction)).toEqual({
      picksLockedForDate: null,
      pickedTaskIds: [],
      selectionComplete: false,
    });
  });

  it("ignores unknown actions", () => {
    const state = {
      picksLockedForDate: "2026-01-01",
      pickedTaskIds: ["a", "b", "c"],
      selectionComplete: true,
    };
    expect(morning3Reducer(state, unknownAction)).toBe(state);
  });

  it("selects Morning 3 state and its fields from the root state", () => {
    const morning3 = {
      picksLockedForDate: "2026-01-01",
      pickedTaskIds: ["a", "b"],
      selectionComplete: true,
    };
    const state = { morning3 } as import("@/store/store").RootState;

    expect(selectMorning3(state)).toBe(morning3);
    expect(selectPickedTaskIds(state)).toEqual(["a", "b"]);
    expect(selectPicksLockedForDate(state)).toBe("2026-01-01");
    expect(selectMorning3SelectionComplete(state)).toBe(true);
  });
});

describe("dailyResetSlice", () => {
  it("has the expected name", () => {
    expect(dailyResetSlice.name).toBe("dailyReset");
  });

  it("returns the initial state", () => {
    expect(dailyResetReducer(undefined, unknownAction)).toEqual({
      isActive: false,
      pendingTaskIds: [],
      currentIndex: 0,
      lastResetDate: null,
    });
  });

  it("ignores unknown actions", () => {
    const state = {
      isActive: true,
      pendingTaskIds: ["a"],
      currentIndex: 1,
      lastResetDate: "2026-01-01",
    };
    expect(dailyResetReducer(state, unknownAction)).toBe(state);
  });
});
