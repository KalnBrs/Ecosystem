import type { RootState } from "@/store/store";

/** Selects the complete Morning 3 slice from the Redux store. */
export const selectMorning3 = (state: RootState) => state.morning3;

/** Selects the IDs of tasks currently picked for Morning 3. */
export const selectPickedTaskIds = (state: RootState) =>
  selectMorning3(state).pickedTaskIds;

/** Selects the date on which the Morning 3 picks were locked, if any. */
export const selectPicksLockedForDate = (state: RootState) =>
  selectMorning3(state).picksLockedForDate;

/** Selects whether the Morning 3 selection step is complete. */
export const selectMorning3SelectionComplete = (state: RootState) =>
  selectMorning3(state).selectionComplete;
